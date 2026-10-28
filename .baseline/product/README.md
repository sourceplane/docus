# docus

Documentation written in Markdown, built with
[Docus](https://docus.dev) on Nuxt and Nuxt Content — a landing page, docs
with navigation, full-text search, dark mode, Open Graph images, llms.txt,
raw Markdown for agents and an MCP server — on **Cloudflare Workers +
Static Assets** through Nitro's `cloudflare_module` preset. Every page is
prerendered at build time and served as a static asset; the Worker answers
what has to run — Nuxt Content's queries, the MCP server, the sitemap —
from a **Cloudflare D1** database that Terraform provisions per
environment. Nuxt Content creates and fills its tables in it from the
content each build bundles, on the first query after a deploy.

## Live deployment

<!-- 02-docs:begin -->
Not recorded yet. The bootstrap's last phase writes the live URLs, the
workspace and the secrets the site uses into
[ai/context/deployment.md](ai/context/deployment.md); how the site deploys
and how to operate it is in
[ai/context/operations.md](ai/context/operations.md).
<!-- 02-docs:end -->

## Writing the docs

The pages are Markdown files in `apps/web/content/`: `index.md` is the
landing page, each numbered directory a section of the navigation (the
number orders it and is not part of the URL), each file a page with its
`title` and `description` in the front matter. Docus's components (callouts,
code groups, tabs, cards, steps) are written inline as MDC — the
`2.essentials` section is the reference, and
[docus.dev](https://docus.dev) has the rest. Images go in `apps/web/public/`.
Merge, and the pages are rebuilt and the site redeployed.

The site's name — the header, every page's title, llms.txt — is
`apps/web/site.ts`. The logo, the header's links, the social links, the
colours and the table of contents go in an `apps/web/app.config.ts`
(Docus's `header`, `socials`, `github`, `toc`, `seo` and `ui` keys, per
[docus.dev](https://docus.dev)).

## What is here

| Surface | Where |
|---|---|
| The pages (Markdown) and their images | `apps/web/content`, `apps/web/public` |
| The site's name | `apps/web/site.ts` |
| Docus (the layer), Nuxt Content on D1, the Workers build | `apps/web/nuxt.config.ts` |
| Workers bindings and deploy contract | `apps/web/wrangler.template.jsonc` + `wiring.fixture.json` (→ `wrangler.jsonc`), `component.yaml` |
| The D1 database (stage, prod) | `infra/terraform/cloudflare-d1` |
| Tests | `tests/web` (vitest): the site's name, its Workers and D1 configuration, every page's title and every internal link |

## Getting started

```bash
pnpm install
pnpm run wire:fixture   # render apps/web/wrangler.jsonc from the offline fixture
pnpm typecheck
pnpm lint
pnpm test
pnpm build              # nuxt build: the Worker in apps/web/.output/server, the prerendered pages in .output/public
```

```bash
pnpm --filter @app/web dev       # http://localhost:3000 — the content in a local SQLite file, reloaded as you edit
pnpm --filter @app/web preview   # wrangler dev over the built Worker, a local D1 behind the DB binding
```

## How the database is wired

The Worker binds the database as `DB`, and Nuxt Content queries it there
(`content.database` in `nuxt.config.ts`). Its id is never hand-written:
`apps/web/wrangler.template.jsonc` names it as a wiring token, and
`wrangler.jsonc` is that template rendered — from `wiring.fixture.json`
(placeholder ids) for local work and verification, and on every deploy from
the document the `cloudflare-d1` Terraform root publishes after its apply
(`WIRING_CLOUDFLARE_D1`, per environment). Edit the template, then
`pnpm run wire:fixture` and commit the render with the template.

There is no schema to migrate. Each build bundles the content as a SQL
dump; on the first query after a deploy, Nuxt Content compares the dump's
checksum with the one it recorded in the database (`_content_info`) and
recreates its tables (`_content_docs`, `_content_landing`) when they differ.
The database holds nothing that is not in the repository.

## How it deploys

Merges to `main` converge through [Orun](https://github.com/sourceplane/orun):
`.github/workflows/ci.yml` plans the changed components and runs each lane
against the workspace in `intent.yaml`. Per environment, the D1 database
applies first, then the site builds with that environment's database id and
origin and deploys — to `stage`, then to `prod` once
stage has converged on the same commit; `dev` only verifies. The Worker is
`docus-web-<env>` on your account's workers.dev subdomain, and
every deploy is smoke-tested over HTTP: the home page, and the MCP server
listing the docs — which only a Worker that queried its database can. A
pull request runs the same pipeline's verify lanes: the site type-checked,
its tests run, and the site built and dry-deployed for each environment,
with nothing deployed. (A push to `main` applies, builds and deploys.)

The pipeline holds one credential, GitHub's own `GITHUB_TOKEN`. The
Cloudflare tokens (one to deploy, one scoped to D1) and the account id are
brokered per run from the workspace's Cloudflare connection, and the
database ids travel as Orun secrets; nothing provider-shaped is stored in the
repository or in GitHub.

**Deploy by hand.** Orunbase's **Deploy** button on a component, or **Run
workflow** on the CI workflow in GitHub's Actions tab (on `main`), runs
`ci.yml` for the environment and components you pick, and each one deploys
exactly as a merge would deploy it. Leave the component blank to redeploy
every component in that environment, with nothing changed: after rotating a
secret, say. A component with nothing to run in that environment (a test
suite in `prod`) is left out with a notice.

## Custom domain

The site answers on workers.dev from its first deploy. To serve it on your
own domain:

1. Add the domain to the Cloudflare account the site deploys into, and attach
   it to the Worker (dashboard → Workers & Pages → `docus-web-prod` →
   Settings → Domains & Routes → Add → Custom domain).
2. Set the environment's public origin in `intent.yaml`, so the next deploy
   builds the site's links for it — canonical links, the sitemap, llms.txt,
   the MCP server's page URLs and the Open Graph images (until then they use
   the workers.dev URL):

   ```yaml
   environments:
     prod:
       env:
         SITE_URL: https://docus.example.com
   ```

   The site was born with the reserved placeholder `docus.example.com`
   where its domain goes: that example, and `BASE_DOMAIN` under each
   environment in `intent.yaml`. Replace it with your domain in the same
   change, and land it with a change under `apps/web` so the merge rebuilds
   the site.

## Credits

The site is the default starter of Docus
([nuxt-content/docus](https://github.com/nuxt-content/docus), `.starters/default`,
MIT — `apps/web/LICENSE`). Docus's AI assistant is not enabled: it needs
Vercel's AI Gateway (`AI_GATEWAY_API_KEY`), and turns itself off without it.
