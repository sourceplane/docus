# docus — implementation plan

Three milestones, each one reviewed pull request (DU0 is the repository's
first commit), each green before it merges.

## DU0 — the spec (DU-1)

The repository is born: `intent.yaml` with the placeholder workspace
`ws_CHANGE_ME`, `ci.yml` (byte for byte turso-starter's), the shared
TypeScript and ESLint configuration, the wiring renderer, the spec index,
this doc set and the task contracts.

## DU1 — Docus on Workers and D1 (DU-2)

- The starter in `apps/web`: `content/`, `public/` and its LICENSE as they
  are; `nuxt.config.ts` extending Docus with the site's name from
  `site.ts`, Nuxt Content on the D1 binding `DB`, Nitro's
  `cloudflare_module` preset with `deployConfig: false`.
- `package.json`: docus pinned at 5.15.0, `agents` and
  `@modelcontextprotocol/server` for the MCP toolkit's Cloudflare provider,
  wrangler, `typecheck`/`lint` through `vue-tsc` on the node project.
- `wrangler.template.jsonc` + `wiring.fixture.json`, `component.yaml`
  (deploy contract, `NUXT_SITE_URL` per environment, the smoke).
- The D1 root, from turso-starter's.
- `tests/web`: the site's name, the Workers and D1 configuration, every
  page's title, every internal link.

## DU2 — a baseline (DU-3)

turso-starter's machinery without its migrations: `blueprint.yaml`,
`repo-blueprint.yaml` (three brokered keys), `.baseline/`, the rename
engine (with the upstream credit masked), the bootstrap helpers, the record
renderer (probing `/` and the MCP server), `docs/phases/`, the context
pack, and `testing/` — the leak, placement and wiring gates over D1, and
the e2e tier that builds the stage lane in its job tree and serves the
built Worker over an empty local D1: the pages, the sitemap, llms.txt, the
raw Markdown and the MCP server, which Nuxt Content answers from the
database it filled.
