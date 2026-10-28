# docus — Vercel's Docus template on Cloudflare

**Docus's default starter on Cloudflare alone — Nitro's Workers preset for
Vercel's Nuxt hosting, every page prerendered as a static asset, Nuxt
Content's queries and the docs' MCP server on a D1 database the Worker
binds — and the baseline that makes a copy of it somebody else's
documentation site in one landing.**

| | |
|---|---|
| Status | ✅ Shipped (`baseline-v1`) — proven offline in Baseline CI; not yet live (risk DU-A) |
| Upstream | [nuxt-content/docus](https://github.com/nuxt-content/docus) `.starters/default` (MIT), at `2a9009e` (2026-10-20): docus 5.15.0, Nuxt 4.6, Nuxt Content 3.16 |
| Reference | [turso-starter](https://github.com/sourceplane/turso-starter) — D1 and its wiring; [nuxt-boilerplate](https://github.com/sourceplane/nuxt-boilerplate) — Nuxt on Nitro's `cloudflare_module` preset |
| Key | `DU` |

## Read in this order

1. [design.md](design.md) — the template, how each Vercel piece maps to
   Cloudflare, the repository and the build, and the alternative rejected.
2. [implementation-plan.md](implementation-plan.md) — the milestones.
3. [risks-and-open-questions.md](risks-and-open-questions.md) — what is not
   proven, and what was accepted.
4. [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) — what shipped, and
   every departure from the upstream template.

## Milestones

| Milestone | What it lands | Task |
|---|---|---|
| DU0 — the spec | the repository, its intent, CI, tooling and spec index; this doc set | DU-1 |
| DU1 — Docus on Workers and D1 | the starter in `apps/web` on Nitro's Workers preset with Nuxt Content on D1, the D1 root, the tests | DU-2 |
| DU2 — a baseline | the console card, the build document, the context pack and the baseline's tests | DU-3 |
