# cloudflare-d1

Provisions the Cloudflare D1 database Nuxt Content serves the docs from, for stage and prod

Terraform-managed infrastructure, planned and applied per environment by its CI lane.

|              |                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Type         | `terraform`                                                                                          |
| Source       | `infra/terraform/cloudflare-d1`                                                                      |
| Environments | `stage`: `plan-only`, `apply` on a push to `main` · `prod`: `plan-only`, `apply` on a push to `main` |

## Depends on

- (none)

## Depended on by

- **web** — The documentation site (Docus on Nuxt, Cloudflare Workers + Static Assets through Nitro's cloudflare_module preset, Nuxt Content on D1, per environment)
