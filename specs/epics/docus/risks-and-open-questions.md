# docus — risks and open questions

| ID | Risk | State | Notes |
|---|---|---|---|
| DU-A | `baseline-v1` is not yet proven live | OPEN | Proven offline in Baseline CI: the offline bootstrap with the blueprint's own hooks, the stage lane's own steps in a staged job tree (the stage database id rendered, the dry run binding it), the built Worker served by `wrangler dev` over an empty local D1 — every page, the sitemap, llms.txt, the raw Markdown, and the MCP server answering from the tables Nuxt Content created |
| DU-B | Nuxt Content fills D1 on a request | ACCEPTED | The first query after a deploy recreates the tables from the bundled dump (the smoke's `/mcp` call is that query); a later build with different content does the same. Concurrent first requests may both import — Nuxt Content's own behaviour on any SQL database |
| DU-C | No AI assistant | ACCEPTED | It needs Vercel's AI Gateway. Docus turns it off without `AI_GATEWAY_API_KEY`; everything else in the template works. An owner who wants it supplies a key at build and run time |
| DU-D | `typecheck` covers the node project only | ACCEPTED | `nuxt typecheck` fails inside the Docus layer's own components (5.15.0, and the upstream starter likewise). `vue-tsc` on `.nuxt/tsconfig.node.json` checks the site's config and `site.ts` |
| DU-E | The MCP toolkit's Cloudflare provider | WATCH | It imports `agents` and `@modelcontextprotocol/server`, which Docus does not declare; pinned here (`agents` ^0.31, the server at 2.3.1). A Docus upgrade may change what it needs — the e2e tier's MCP checks catch it |
| DU-F | stack-tectonic 0.19.0, not 0.20.0 | ACCEPTED | The job installs inside its own tree, as every sibling verified; 0.20.0's lane-shared install is unproven with Nitro's bundler |
| DU-G | docus pinned at 5.15.0, not `latest` | ACCEPTED | A baseline is reproducible; a bump is a deliberate change |
