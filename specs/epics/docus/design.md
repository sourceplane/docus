# docus — design

## The template

Docus is a Nuxt layer: a documentation theme (Nuxt UI), its pages, its
search, a sitemap, llms.txt, raw Markdown for agents, Open Graph images, an
MCP server (`@nuxtjs/mcp-toolkit`) and an optional AI assistant, all from
`extends: ['docus']`. Its default starter, `.starters/default` — the
template Vercel lists — is that one line of `nuxt.config.ts`, a
`package.json`, and the site itself: Markdown in `content/` (a landing page
and two sections, Getting started and Essentials) and `public/`. Nuxt
Content compiles the Markdown at build time into collections (`landing`,
`docs`) and serves them from a SQL database at run time — on Vercel, an
SQLite file Nitro's Vercel preset sets up; here, D1.

This port is the starter at `2a9009e` (2026-10-20), its content unchanged,
with docus pinned at 5.15.0 instead of `latest`.

## How it maps to Cloudflare

| Vercel | Here |
|---|---|
| Zero-config Nuxt hosting (Nitro's Vercel preset) | Nitro's `cloudflare_module` preset: `.output/server/index.mjs` is the Worker, `.output/public` its static assets; `deployConfig: false`, the committed `wrangler.jsonc` is the config |
| Pages served by Vercel's CDN | Every page prerendered by `nuxt build` (Docus crawls its links) and served as Workers Static Assets; the Worker runs only for what is not a file |
| Nuxt Content's SQLite on Vercel | `content.database: { type: 'd1', bindingName: 'DB' }`: a D1 database per environment from `infra/terraform/cloudflare-d1`, its id rendered into `wrangler.jsonc` from the root's wiring document. Nuxt Content creates and fills its tables from the dump the build bundles, on the first query after a deploy — no migrations |
| The MCP server (`/mcp`) on a Vercel Function | The same server in the Worker: the toolkit's Cloudflare provider, which needs `agents` and `@modelcontextprotocol/server` as dependencies |
| `VERCEL_URL` / `NUXT_SITE_URL` for the site's origin | `NUXT_SITE_URL` set by the build per environment: its `SITE_URL` in `intent.yaml`, else its workers.dev URL |
| The AI assistant (Vercel AI Gateway, `AI_GATEWAY_API_KEY`) | Off. AI Gateway is outside what a baseline here may depend on; Docus turns the assistant off without a key, and nothing else needs it |
| Deploy on push | Orun applies the database and deploys `<repo>-web-{stage,prod}` on merge to `main` |
| "Deploy with Vercel" | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

## The repository

turso-starter's shape without its migrations: a pnpm workspace with
`apps/web` (the site), `infra/terraform/cloudflare-d1` (the database per
environment), `tests/web` (vitest), the shared `tooling/` (TypeScript,
ESLint, the wiring renderer) and the baseline's own machinery
(`.baseline/`, the blueprints, `tooling/rebrand`, `tooling/bootstrap`,
`hooks/`, `testing/`). The site's name is one literal, `SITE_NAME` in
`apps/web/site.ts`, read into Docus's `site.name` — the header, every
page's title, llms.txt, the Open Graph site name.

The slug `docus` is also the name of the layer the site extends and of the
package it depends on, and the template's content says "Docus" throughout.
So the rename engine masks the upstream's own uses (`extends: ['docus']`,
the dependency, `docus.dev`, `nuxt-content/docus`, the old CLI in the
migration guide) and the identity's Pascal form is `DocusBaseline`, which
appears nowhere: the template's prose about Docus is the template's, not
the baseline's name.

## The build

`buildCommand` renders `wrangler.jsonc` from the environment's wiring
document, then runs `nuxt build` with `NUXT_SITE_URL` for the environment.
The build prerenders 13 pages and their payloads, the raw Markdown and
llms.txt, Open Graph images and the client's search dump, and bundles the
server: about 4.5 MB, 1.3 MB gzipped, under Workers Free's 3 MiB. The smoke
fetches `/` (a static asset: Docus's Nuxt root) and calls the MCP server's
`list-pages` tool, which only the Worker can answer, by querying D1.

## Out of scope

- The AI assistant (AI Gateway).
- Nuxt Studio's editing (it needs Studio's hosted service and a GitHub app).
- i18n: the default starter is English only; Docus's i18n starter is a
  separate template.

## The alternative rejected

A fully static site (`nuxt generate`, no Worker) is simpler and builds the
pages the same, but loses the MCP server — the toolkit needs a server — and
Nuxt Content's server queries. Docus ships the MCP server as a feature, so
the Worker stays, and D1 is the one binding it needs.
