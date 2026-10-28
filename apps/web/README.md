# apps/web — the site

Documentation written in Markdown, from the default starter of
[Docus](https://github.com/nuxt-content/docus) (`.starters/default`, MIT),
running on Cloudflare Workers + Static Assets with Nuxt Content's queries on
Cloudflare D1:

- `nuxt.config.ts` extends the Docus layer, names the site from `site.ts`,
  puts Nuxt Content's database on the `DB` binding (`type: 'd1'`) and builds
  with Nitro's `cloudflare_module` preset — the Worker in
  `.output/server/index.mjs`, every page prerendered into `.output/public`
- `content/` is the site: `index.md` the landing page, a numbered
  directory per section, a Markdown file per page
- Nuxt Content creates and fills its tables in D1 from the dump the build
  bundles, on the first query after a deploy — there are no migrations
- the MCP server at `/mcp` (Docus's `list-pages` and `get-page` tools) and
  the sitemap are answered by the Worker; the pages, llms.txt and the raw
  Markdown under `/raw` are static assets
- Docus's AI assistant is off: it needs Vercel's AI Gateway
  (`AI_GATEWAY_API_KEY`) and turns itself off without it

The site's name is in `site.ts`.

```bash
pnpm run wire:fixture   # wrangler.jsonc from the template, placeholder database ids
pnpm dev                # nuxt dev on http://localhost:3000, the content in a local SQLite file
pnpm build              # nuxt build → .output/ (set NUXT_SITE_URL for the canonical links, the sitemap and llms.txt)
pnpm preview            # wrangler dev over the built Worker, a local D1 behind DB
```

How it is deployed — the database from `infra/terraform/cloudflare-d1`, its
id rendered into `wrangler.jsonc` per environment, the origin passed to the
build as `NUXT_SITE_URL`, on merge to `main` — is the repository's README
and `component.yaml` beside this file.
