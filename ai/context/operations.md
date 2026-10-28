# docus — operating contract (for humans and agents)

This is the standing guide to how this site is deployed and operated.
Instance facts (live URLs, workspace, the secrets it uses) live in
[deployment.md](deployment.md), rendered from probed reality by the
bootstrap's `02-docs` phase; this file is the contract that stays true
between deployments. It is written to give an agent with repository read
access enough context to reason about and operate the site without any
other source.

## What this system is

A documentation site — Docus on Nuxt and Nuxt Content — on Cloudflare
alone, expressed as an Orun component-native desired-state repo.

- **`infra/terraform/cloudflare-d1`** — one Cloudflare D1 database per
  deployed environment (`stage`, `prod`), applied by Terraform. After each
  apply it publishes a wiring document — `{d1_database_id, d1_database_name}`
  — as the Orun secret `WIRING_CLOUDFLARE_D1` on that environment.
- **`apps/web`** — the site: the Docus layer (`extends: ['docus']`) and the
  pages, Markdown in `content/`, built by Nitro's `cloudflare_module` preset
  into one Worker (`.output/server`) plus Static Assets (`.output/public`).
  Every page, llms.txt, the raw Markdown under `/raw` and the Open Graph
  images are prerendered static assets; the Worker answers the rest — the
  MCP server at `/mcp`, the sitemap, Nuxt Content's query endpoint — by
  querying Nuxt Content's tables in the database bound as `DB`. Nuxt
  Content creates and fills those tables from the dump the build bundles,
  on the first query after a deploy, so there are no migrations and the
  database holds nothing the repository does not. Docus's AI assistant is
  off: it needs Vercel's AI Gateway.
- **`tests/web`** — the site's name, its Workers and D1 configuration,
  every page's title and every internal link (vitest), verified on the
  `dev` rung.
- **`tooling/*`** — shared TypeScript and ESLint configuration and the
  wrangler renderer that turns `wrangler.template.jsonc` plus a wiring
  document into `wrangler.jsonc`.

Environments: **`stage`** and **`prod`** are deployed; **`dev` is
verify-only by design** — lanes build and test, nothing deploys, and no D1
database exists for it (its build renders the committed fixture).

The Worker is about 1.3 MiB gzipped: Workers Free is enough.

## Identity and tenancy

Every remote operation runs against ONE Orun workspace, declared in
`intent.yaml` under `execution.state.workspace` — committed, enforced, and
what CI uses. Do not remove it; headless credentials depend on it. If it
reads `ws_SET_ME`, the bootstrap had no workspace to write: set the real one
before anything else.

## How deployment works

1. Merge (or push) to `main`.
2. CI (`.github/workflows/ci.yml`) runs `orun plan --changed` — only
   components whose files changed are planned — then runs each planned lane
   with `orun run --remote-state`, authenticated by GitHub OIDC (the
   exchange resolves this repository's linked workspace server-side).
3. **The database, then the Worker**, per environment. `cloudflare-d1`
   applies and publishes `WIRING_CLOUDFLARE_D1`. `apps/web` declares an
   enforced `dependsOn` on it for pushes to `main`, so it starts after that
   apply — a job resolves its secrets when it starts, so the document is
   there.
4. `apps/web` renders `wrangler.jsonc` from that document (the real
   database id), builds once per environment with `NUXT_SITE_URL` set to
   that environment's `SITE_URL` (intent.yaml) or its workers.dev URL,
   `wrangler deploy` ships `docus-web-<env>`, and a smoke test fetches `/`
   (Docus's page) and calls the MCP server's `list-pages` tool, which must
   list the docs — which only the Worker can, querying D1 (that first
   query is also what fills the database).
5. `prod` deploys after `stage` has converged on the same commit
   (`environments.prod.promotion` in intent.yaml).
6. **The convergence run is the deployment.** A green run means every
   planned lane applied. Failed lanes are retried with
   `gh run rerun --failed`, which resumes the same execution.

On a pull request nothing applies or deploys: the D1 root plans, the site
builds and dry-deploys, and the edge in step 3 is advisory.

Caveats that matter:

- A push that touches no component files plans zero lanes — that run is
  green and deployed nothing. Never treat "latest run green" as "site
  converged"; probe the URLs instead.
- A change to `intent.yaml`'s `environments` maps to no component and
  redeploys nothing on its own. Land it with a change under `apps/web`.
- `wrangler.jsonc` is generated. Edit `wrangler.template.jsonc`, run
  `pnpm run wire:fixture` and commit both; the deploy renders its own
  config from the template, so a stale committed render misleads local work.
- Never write to Nuxt Content's tables by hand: the next build's dump
  replaces them. The content is the Markdown in `apps/web/content`.

## Secrets model

- **Brokered provider secrets**, minted per run from the workspace's
  Cloudflare connection — no long-lived values at rest, nothing to rotate by
  hand:
  - `CLOUDFLARE_API_TOKEN` (`workers-deploy`: Workers Scripts) — the site's
    deploy;
  - `CLOUDFLARE_D1_TOKEN` (`d1-edit`: D1) — the D1 root's apply, which
    binds it as its `CLOUDFLARE_API_TOKEN`; the deploy token cannot touch
    D1;
  - `CLOUDFLARE_ACCOUNT_ID` — a connection fact both bind.
- **Wiring**: `WIRING_CLOUDFLARE_D1` on `stage` and `prod`, written by the
  D1 root's apply (lease-published), read by the Worker's build as
  `WIRING_CLOUDFLARE_D1_<ENV>`. It holds ids, not
  credentials.
- Inspect by NAME only: `orun secrets list --org <ws> --project` and
  `--env stage|prod`. No tooling in this repository prints a secret value,
  and no document in `ai/context/` may contain one.
- The site needs no runtime secret: the binding is the credential.

## Verifying the system

```bash
# the site on each environment (also recorded, probed, in deployment.md);
# the MCP server lists the pages from D1
curl -s -o /dev/null -w '%{http_code}\n' https://docus-web-prod.your-workers-subdomain.workers.dev/
curl -s -X POST -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list-pages","arguments":{}}}' \
  https://docus-web-stage.your-workers-subdomain.workers.dev/mcp

# the wiring the deploys read, and workspace readiness
orun secrets list --org <ws> --env stage && orun secrets list --org <ws> --env prod
orun integrations list --org <ws> --json && orun cloud check --org <ws>
```

## Common operations

| task | how |
|---|---|
| write or change a page | Markdown under `apps/web/content/` (a numbered directory per section, a file per page, its `title` and `description` in the front matter), merge — the pages are rebuilt and Nuxt Content refreshes D1 on the first query |
| change the site's name | `SITE_NAME` in `apps/web/site.ts`, merge |
| change the theme, logo, header or social links | an `apps/web/app.config.ts` (Docus's `header`, `socials`, `github`, `toc`, `seo`, `ui` keys), merge |
| preview locally | `pnpm --filter @app/web dev` (the content in a local SQLite file), or `pnpm build` then `pnpm --filter @app/web preview` (the built Worker over a local D1) |
| deploy a change | merge to `main`; watch the run; failed lanes → `gh run rerun --failed` |
| deploy by hand | Orunbase's Deploy button, or `gh workflow run ci.yml --ref main -f environment=<env> [-f component=<a,b>]` — the named components (blank: every one) run in that environment as a merge runs them; started off `main` it is refused |
| redeploy without a change | edit the last line of `apps/web/component.yaml` (`# orun: redeploy <reason> <stamp>`) and merge — it is a deploy trigger, nothing reads it |
| query a live database | `wrangler d1 execute <name> --remote --command "SELECT path, title FROM _content_docs"` (the name is in the environment's `WIRING_CLOUDFLARE_D1`) — read only: the next deploy replaces it |
| turn on the AI assistant | needs a Vercel AI Gateway key (`AI_GATEWAY_API_KEY`) at build time and as a Worker secret — outside what this site was built to depend on |
| add a binding (R2, KV, another D1) | a Terraform root under `infra/terraform/` that publishes `WIRING_<ROOT>`, a token in `wrangler.template.jsonc`, its fixture entry, the root in the build's `--components`, the `WIRING_<ROOT>_<ENV>` secretEnv and an enforced `dependsOn` on it in `apps/web/component.yaml` |
| serve a custom domain | attach it to the Worker in Cloudflare and set `SITE_URL` for the environment in `intent.yaml` — the next deploy builds the canonical links, the sitemap and llms.txt for it (README, "Custom domain") — then replace the placeholder `docus.example.com` in `intent.yaml`'s `BASE_DOMAIN` with it |
| add a runtime secret | `orun secrets set <KEY> --org <ws> --env <env>` |
| headless credentials | `ORUN_TOKEN` (workspace-scoped) + `GITHUB_TOKEN` |

The deployment record is the bootstrap's `02-docs` phase. Re-running it (the
Orun console's Retry on that phase, or `orun new … --phase 02-docs`)
re-probes the URLs and re-renders [deployment.md](deployment.md); it is
idempotent.

## Evolution

D1 caps a database's size (500 MB on Workers Free); the content of a
documentation site is a few megabytes. Structural changes follow the same contract that deployed the
site: add a component under `apps/`, `infra/` or `packages/` with a
`component.yaml`, land it as a pull request, and the convergence run applies
it.
