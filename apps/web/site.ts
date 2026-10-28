// The site's name, written once. Docus reads it as `site.name` (nuxt.config.ts):
// the header's title, every page's title template ("%s - <name>"), the
// llms.txt title and the Open Graph site name. Without it Docus would name the
// site after package.json, which in this workspace is `@app/web`. A site built
// from this baseline gets it rewritten to its own name, so keep it literal,
// double-quoted and on one line.
export const SITE_NAME = "Docus"
