import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const web = path.resolve(__dirname, "../../../apps/web");
const read = (rel: string) => readFileSync(path.join(web, rel), "utf8");

describe("the site's name (apps/web/site.ts)", () => {
  it("is written once, as a literal", () => {
    const m = /^export const SITE_NAME = (".*")$/m.exec(read("site.ts"));
    expect(m, "SITE_NAME line").not.toBeNull();
    expect(JSON.parse(m?.[1] ?? "\"\"").trim()).not.toBe("");
  });

  it("is what Docus names the site (site.name), not package.json's @app/web", () => {
    const config = read("nuxt.config.ts");
    expect(config).toContain("import { SITE_NAME } from './site'");
    expect(config).toMatch(/site:\s*\{\s*name: SITE_NAME,/);
  });
});

describe("the Workers build (apps/web/nuxt.config.ts, wrangler.template.jsonc)", () => {
  it("extends the Docus layer and builds with Nitro's Cloudflare preset", () => {
    const config = read("nuxt.config.ts");
    expect(config).toContain("extends: ['docus']");
    expect(config).toContain("preset: 'cloudflare_module'");
    // The committed wrangler config is what deploys; Nitro writes none.
    expect(config).toContain("deployConfig: false");
  });

  it("puts Nuxt Content on the D1 binding the Worker declares", () => {
    const config = read("nuxt.config.ts");
    const binding = /database: \{ type: 'd1', bindingName: '([A-Z_]+)' \}/.exec(config)?.[1];
    expect(binding).toBe("DB");
    const template = read("wrangler.template.jsonc");
    expect(template).toContain(`"binding": "${binding}"`);
    expect(template).toContain("@@wiring(cloudflare-d1/__ENV__:d1_database_id)@@");
  });

  it("deploys the Worker Nitro emits and the pages it prerenders", () => {
    const template = read("wrangler.template.jsonc");
    expect(template).toContain('"main": "./.output/server/index.mjs"');
    expect(template).toContain('"directory": "./.output/public"');
  });
});
