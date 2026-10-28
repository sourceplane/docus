# docus — implementation status

| Milestone | State | Landed |
|---|---|---|
| DU0 — the spec | ✅ | the repository's first commit |
| DU1 — Docus on Workers and D1 | ✅ | DU-2 |
| DU2 — a baseline | ✅ | DU-3, tagged `baseline-v1` |

## Departures from the upstream template

Everything not listed here is Docus's `.starters/default` as it is at
`2a9009e`: the content, the images, the LICENSE.

| # | What | Why |
|---|---|---|
| 1 | The starter lives in `apps/web` of a pnpm workspace; its README is replaced by `apps/web/README.md`, its `.gitignore` merged into the root's | The repository's shape |
| 2 | `docus: latest` → `docus: 5.15.0` | Reproducible builds |
| 3 | `nuxt.config.ts`: `site.name` from `site.ts` (`SITE_NAME`) | One rename seam; upstream takes the name from the package |
| 4 | `nuxt.config.ts`: `content.database` on the D1 binding `DB` | Nuxt Content's SQLite file on Vercel becomes D1 |
| 5 | `nuxt.config.ts`: Nitro's `cloudflare_module` preset, `deployConfig: false`, `nodeCompat: true` | Vercel's Nuxt hosting becomes a Worker with Static Assets; the committed `wrangler.jsonc` is the config |
| 6 | Dependencies added: `agents`, `@modelcontextprotocol/server` (2.3.1); dev: `wrangler`, `typescript`, `vue-tsc` | The MCP toolkit's Cloudflare provider imports the first two; the rest build, preview and type-check |
| 7 | Scripts: `preview` (wrangler dev), `postinstall` (`nuxt prepare`), `typecheck`/`lint` as `vue-tsc` on `.nuxt/tsconfig.node.json` | `nuxt typecheck` fails inside the Docus layer itself (risk DU-D) |
| 8 | `NUXT_SITE_URL` set by the build per environment | Vercel supplies the origin; here it is the environment's `SITE_URL` or workers.dev URL |
| 9 | The AI assistant is not enabled | It needs AI Gateway (risk DU-C) |
| 10 | `wrangler.template.jsonc`, `wiring.fixture.json`, `wrangler.jsonc` (the render), `component.yaml`, `.env.example`, `tsconfig.json`'s comment | The Workers runtime and the deploy contract |
| 11 | pnpm allow-lists `better-sqlite3` and `vue-demi`'s build scripts | pnpm 10 blocks them; Nuxt Content's build-time SQLite needs its binary |
