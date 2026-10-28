# docus

Vercel's [Docus](https://github.com/nuxt-content/docus) template —
documentation written in Markdown, built with Docus on Nuxt and Nuxt
Content: a landing page, docs with navigation, full-text search, dark mode,
Open Graph images, llms.txt, raw Markdown for agents and an MCP server —
running on **Cloudflare Workers + Static Assets** through Nitro's
`cloudflare_module` preset, every page prerendered and Nuxt Content's
queries on a **Cloudflare D1** database Terraform provisions per
environment, deployed by
[Orun](https://github.com/sourceplane/orun) to stage and prod on every merge.
Packaging it as an Orun baseline is the next milestone (DU2).

The port is Docus's default starter (`.starters/default`), its content
unchanged: Vercel's Nuxt hosting becomes Nitro's Workers preset, Nuxt
Content's SQLite becomes the D1 binding — which Nuxt Content creates its
tables in and fills from the build's dump on the first query, so there are
no migrations — and the site's origin is set per environment. The AI
assistant is left off: it needs Vercel's AI Gateway. See
[`specs/epics/docus`](specs/epics/docus/README.md) for the design, the
milestones and the as-built status.

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
