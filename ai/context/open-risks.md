# docus — open risks

What is not yet proven or not yet decided. The full write-up of every risk,
including the accepted and resolved ones, is
`specs/epics/docus/risks-and-open-questions.md`; this page lists only what
is still live, so it should be short.

| ID | Risk | State | What closes it |
|---|---|---|---|
| DU-A | `baseline-v1` is not yet proven live; it is proven offline in Baseline CI (the offline bootstrap, the stage lane's own steps, the built Worker served by `wrangler dev` over an empty local D1: the pages, the sitemap, llms.txt, the raw Markdown and the MCP server answering from the tables Nuxt Content created) | OPEN | One console bootstrap from `baseline-v1` |
| DU-E | The MCP toolkit's Cloudflare provider needs `agents` and `@modelcontextprotocol/server`, which Docus does not declare | WATCH | The e2e tier's MCP checks on every Docus bump |

Accepted, and worth knowing before you change them: DU-B (Nuxt Content
fills D1 on the first query), DU-C (no AI assistant), DU-D (typecheck on the
node project), DU-F (stack-tectonic 0.19.0), DU-G (docus pinned).
