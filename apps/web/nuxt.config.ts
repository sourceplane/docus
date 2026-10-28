import { SITE_NAME } from './site'

// Docus is a Nuxt layer: the theme, the pages, search, the sitemap, llms.txt,
// Open Graph images and an MCP server all come from `extends: ['docus']`; the
// site's own files are content/ and public/.
//
// Vercel's zero-config Nuxt hosting becomes Nitro's Cloudflare Workers preset:
// `nuxt build` prerenders every page (Docus crawls its links) into
// .output/public — the static assets — and emits .output/server/index.mjs, the
// Worker, for what must run per request: the MCP server (/mcp) and Nuxt
// Content's queries (search, the MCP tools). Those read a Cloudflare D1
// database, bound as DB, which Nuxt Content creates its tables in and fills
// from the dump the build bundles, on the first query after a deploy. The
// committed wrangler.jsonc is the deployable config, so Nitro writes no
// wrangler.json of its own (deployConfig: false).
//
// The site's public origin (canonical links, the sitemap, llms.txt, Open Graph
// URLs) is NUXT_SITE_URL, which the deploy sets per environment.
export default defineNuxtConfig({
  extends: ['docus'],
  site: {
    name: SITE_NAME,
  },
  content: {
    database: { type: 'd1', bindingName: 'DB' },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: false,
      nodeCompat: true,
    },
  },
})
