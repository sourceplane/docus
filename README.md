# docus

Vercel's [Docus](https://github.com/nuxt-content/docus) template —
documentation written in Markdown, built with Docus on Nuxt and Nuxt
Content: a landing page, docs with navigation, full-text search, dark mode,
Open Graph images, llms.txt, raw Markdown for agents and an MCP server —
running on **Cloudflare Workers + Static Assets** through Nitro's
`cloudflare_module` preset, every page prerendered and Nuxt Content's
queries on a **Cloudflare D1** database Terraform provisions per
environment, and packaged as an **Orun baseline**: one command takes a new
documentation site from nothing to live on stage and prod, in its own
repository, under its own name — in ONE landing.

The port is Docus's default starter (`.starters/default`), its content
unchanged: Vercel's Nuxt hosting becomes Nitro's Workers preset, Nuxt
Content's SQLite becomes the D1 binding — which Nuxt Content creates its
tables in and fills from the build's dump on the first query, so there are
no migrations — and the site's origin is set per environment. The AI
assistant is left off: it needs Vercel's AI Gateway. What the baseline adds
is everything needed to make a copy of it somebody else's, built the way
[turso-starter](https://github.com/sourceplane/turso-starter) is. See
[`specs/epics/docus`](specs/epics/docus/README.md) for the design, the
milestones and the as-built status.

## Instantiating a product

```bash
git clone --depth 1 --branch <baseline-tag> https://github.com/sourceplane/docus
cd docus
orun new --blueprint repo-blueprint.yaml --out ~/sites/acme-docs --run-hooks --resume \
  --set reponame=acme-docs --set productname="Acme Docs" \
  --set githuborg=acme-inc --set subdomain=<workers-dev-subdomain>
```

Or, once the platform's registry lists it, from the Orun console (Baselines →
`docus` → Build). Two phases: **`01-product`** creates the repository and
lands the whole product as ONE pull request — intent, CI, tooling, the D1
root, the site and its tests — and one convergence, per environment,
applies the D1 database, then deploys the site with its id; **`02-docs`**
records the live deployment from probed facts.
**[BOOTSTRAP.md](BOOTSTRAP.md)** is the operator guide;
[docs/phases/](docs/phases/README.md) has a page per phase.

The new repository receives the **product only** — the site and its
content, its D1 root, its tests, its CI, its tooling, a README of its own
and its operating contract — renamed throughout to the product's name,
repository, Cloudflare Worker and database names. None of this repository's
machinery ships.

| What makes it a baseline | Where |
|---|---|
| The console card (inputs, secrets, programme) | `blueprint.yaml` |
| The build document (modules, phases, hooks) | `repo-blueprint.yaml` |
| This tree's identity, and the bootstrap's task contracts | `.baseline/` |
| The rename engine | `tooling/rebrand/rebrand.mjs` |
| The bootstrap's helpers (deferrals, redeploy marker, work-tree strip) | `tooling/bootstrap/` |
| The deployment-record renderer | `hooks/render-deployment-docs.sh` |
| The product's README and context pack | `.baseline/product/README.md`, `ai/context/` |
| The baseline's tests: contract, wiring, leak, offline bootstrap, end to end | `testing/`, `.github/workflows/baseline.yml` |
| Cutting a `baseline-vN` tag | `.github/workflows/tag.yml` |

## What is here (the product)

| Surface | Where |
|---|---|
| The pages (Markdown) and their images | `apps/web/content`, `apps/web/public` |
| The site's name | `apps/web/site.ts` |
| Docus (the layer), Nuxt Content on D1, the Workers build | `apps/web/nuxt.config.ts` |
| Workers bindings and deploy contract | `apps/web/wrangler.template.jsonc` + `wiring.fixture.json` (→ the committed `wrangler.jsonc`), `component.yaml` |
| The D1 database (stage, prod) | `infra/terraform/cloudflare-d1` |
| The wrangler renderer | `tooling/wire` |
| Tests | `tests/web` (the site's name, its Workers and D1 configuration, every page's title and every internal link) |

## Getting started

```bash
pnpm install
pnpm run wire:fixture   # render apps/web/wrangler.jsonc from the offline fixture
pnpm typecheck
pnpm lint
pnpm test
pnpm build              # nuxt build → apps/web/.output (the Worker, and every page prerendered)
```

```bash
pnpm --filter @app/web dev       # http://localhost:3000 — the content in a local SQLite file
pnpm --filter @app/web preview   # wrangler dev over the built Worker, a local D1 behind DB
```

## How it maps to Vercel

| Vercel-side | Here |
|---|---|
| Zero-config Nuxt hosting | Nitro's `cloudflare_module` preset: one Worker (`.output/server/index.mjs`) + Static Assets (`.output/public`), `deployConfig: false` |
| Pages on Vercel's CDN | Every page prerendered by `nuxt build` and served as a static asset; the Worker answers the rest |
| Nuxt Content's SQLite | The D1 `DB` binding (`content.database: { type: 'd1' }`); the id and name are rendered into `wrangler.jsonc` per environment from the Terraform root's wiring document. Nuxt Content creates and fills its tables from the build's dump on the first query |
| The MCP server on a Vercel Function | The same server in the Worker, through the MCP toolkit's Cloudflare provider (`agents`, `@modelcontextprotocol/server`) |
| The site's origin (`VERCEL_URL`) | `NUXT_SITE_URL` per environment: its `SITE_URL` in `intent.yaml`, else its workers.dev URL |
| The AI assistant (AI Gateway) | Off — Docus turns it off without `AI_GATEWAY_API_KEY` |
| `docus: latest` | `docus` pinned at 5.15.0 |
| Deploy on push | Orun applies the database and deploys `<repo>-web-{stage,prod}` on merge to `main` |
| "Deploy with Vercel" (clone the template) | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

## How the database reaches the Worker

```
infra/terraform/cloudflare-d1 ──apply──► orun secret WIRING_CLOUDFLARE_D1 (stage, prod)
                                               ▼
apps/web  dependsOn cloudflare-d1 (enforced on main) · secretEnv WIRING_CLOUDFLARE_D1_<ENV>
  build:  tooling/wire/live.mjs → wrangler.jsonc with the environment's database id
          (dev, verify-only, renders the fixture) → nuxt build (NUXT_SITE_URL per environment)
  first query after the deploy: Nuxt Content creates its tables in D1 from the bundled dump
```

`wrangler.jsonc` is committed as the fixture render of
`wrangler.template.jsonc`, because the deploy lane's `verify-app-structure`
step checks the config exists before it builds; `testing/e2e.test.sh` fails
if the two disagree.

## CI

| Workflow | What it runs | Ships to a product |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow a product carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (the site type-checked and its tests run, the site built and dry-deployed per environment), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone is the check; a merge applies the D1 database, then deploys stage → prod. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does. A manual run (Orunbase's Deploy button, or Run workflow on `main`) plans the environment and components it names under the push-to-main trigger, so they deploy as a merge deploys them | yes |
| `baseline.yml` | the baseline's own tiers: contract tests, the wiring path, the blueprint read by the pinned orun, the leak gate, the offline bootstrap with the product's own plan, the product built in the job tree, dry-deployed and served over an empty local D1 | no |
| `tag.yml` | cuts a `baseline-vN` tag (manual) | no |
