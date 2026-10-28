# Epics

Orun-style work programs. Each epic is a folder carrying `epic.yaml` (the
declaration the platform reads: slug, key prefix, milestones with exit
criteria and task keys) beside its doc set. The pull request that adds the
folder is the adoption; the merge creates the epic in the workspace.

| Epic | Cluster | Status | What it is |
|------|---------|--------|------------|
| [`docus/`](./docus/) | **DU** | ✅ Shipped (`baseline-v1`); not yet live | Vercel's Docus template — Markdown documentation on Nuxt and Nuxt Content — on Cloudflare Workers with every page prerendered and Nuxt Content's queries on D1, and an Orun baseline that instantiates it in one landing (DU2) |

As-built ≠ intent: what shipped lives in each epic's `IMPLEMENTATION-STATUS.md`.
