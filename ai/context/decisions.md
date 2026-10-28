# docus — decisions

The choices that shape this repository, one line each, with where the full
reasoning lives. Superseded decisions stay listed, marked, so the history
reads in order.

| # | Decision | Why | Source |
|---|---|---|---|
| 1 | Docus's default starter at `2a9009e`, its content unchanged, docus pinned at 5.15.0 | The template Vercel lists; a pinned layer builds the same every time | `specs/epics/docus/design.md`, risk DU-G |
| 2 | Nitro's `cloudflare_module` preset, every page prerendered, `deployConfig: false` | Vercel's Nuxt hosting becomes one Worker + Static Assets; the committed `wrangler.jsonc` is the config (nuxt-boilerplate's shape) | design.md |
| 3 | A Worker, not a static `nuxt generate` | The MCP server and Nuxt Content's server queries need one | design.md, "The alternative rejected" |
| 4 | Nuxt Content's database is the D1 binding `DB`; no migrations | Nuxt Content creates and fills its tables from the bundled dump on the first query; the database holds nothing the repository does not | risk DU-B |
| 5 | `agents` and `@modelcontextprotocol/server` are dependencies | The MCP toolkit's Cloudflare provider imports them | risk DU-E |
| 6 | The AI assistant is off | It needs Vercel's AI Gateway; Docus turns it off without a key | risk DU-C |
| 7 | `NUXT_SITE_URL` per environment: its `SITE_URL`, else its workers.dev URL | Canonical links, the sitemap, llms.txt, Open Graph images and the MCP server's URLs are absolute; each environment builds anyway | `apps/web/component.yaml` |
| 8 | `typecheck`/`lint` are `vue-tsc` on `.nuxt/tsconfig.node.json` | `nuxt typecheck` fails inside the Docus layer itself | risk DU-D |
| 9 | The site's name is `SITE_NAME` in `apps/web/site.ts`; the identity's Pascal form is `DocusBaseline`, and the upstream's own `docus` (the layer, the package, docus.dev) is masked from the rename | The slug is the template's own word; its prose about Docus is the template's | `tooling/rebrand/rebrand.mjs` |
| 10 | The smoke fetches `/` and calls the MCP server's `list-pages` | The page is a static asset; only the Worker, querying D1, answers the tool | IMPLEMENTATION-STATUS |
| 11 | Three brokered keys in one reconcile: `workers-deploy`, `d1-edit`, the account id | The deploy token cannot touch D1 | `repo-blueprint.yaml` |
| 12 | One landing (`01-product`) then the record (`02-docs`), each checked in the build box | turso-starter's shape: the plan carries the order (database, then Worker) | `docs/phases/README.md` |
| 13 | `ci.yml` plans nothing while `intent.yaml` names `ws_CHANGE_ME`; stack-tectonic 0.19.0 | As every sibling: a bootstrap cannot set a repository variable; the job-scoped install is the verified one | `.github/workflows/ci.yml`, `intent.yaml`, risk DU-F |
| 14 | Component docs are generated from the manifests and checked in CI; orun is pinned only where it runs | A hand-written copy drifts silently | `tooling/catalog/gen-component-docs.py` |
| 15 | `subdomain` is read from the Cloudflare connection, never asked; the console asks for no domain | Both belong to the account or the owner, not to the build | `blueprint.yaml` |
