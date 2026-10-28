# web — architecture

Built by the turbo pipeline from `apps/web` and deployed with wrangler.

|                     |                                    |
| ------------------- | ---------------------------------- |
| Worker config       | `apps/web/wrangler.template.jsonc` |
| Entry               | `./.output/server/index.mjs`       |
| Compatibility date  | `2026-10-01`                       |
| Compatibility flags | `nodejs_compat`                    |

## Bindings

| Binding  | Kind          | Source                                |
| -------- | ------------- | ------------------------------------- |
| `DB`     | D1 database   | `d1_database_id` from `cloudflare-d1` |
| `ASSETS` | Static assets | `./.output/public`                    |

Identifiers marked _from_ a component are filled in at deploy time from
that component's published outputs for the environment being deployed.

## Wiring

Resolved at deploy time from secrets the infrastructure lanes publish (names only):

- `WIRING_CLOUDFLARE_D1_PROD`
- `WIRING_CLOUDFLARE_D1_STAGE`
