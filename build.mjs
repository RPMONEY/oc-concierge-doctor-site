// Builds src/ into site/. Run: node build.mjs
// Every build is numbered (build.json). The number is stamped into every page
// and into /version.txt. PREVIEW=true adds noindex everywhere.
//
// Treatments live in src/treatments/<slug>.json. They are the single source for
// the treatment pages, the header menus, the footer lists and the home page lists,
// so adding a treatment is one JSON file and nothing else.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { renderTreatment, GROUPS } from "./lib/treatment.mjs";

const { build, preview } = JSON.parse(readFileSync("build.json", "utf8"));
const stamp = new Date().toISOString();
const SRC = "src", OUT = "site";
const PARTIALS = join(SRC, "partials");
const TREATMENTS = join(SRC, "treatments");

rmSync(OUT, { recursive: true, force: true });

// Load treatments, in the order set by each file's "order" field.
const treatments = readdirSync(TREATMENTS)
  .filter((n) => n.endsWith(".json"))
  .map((name) => {
    const d = JSON.parse(readFileSync(join(TREATMENTS, name), "utf8"));
    if (d.slug !== name.slice(0, -5)) throw new Error(`${name}: slug "${d.slug}" must match file name`);
    if (!GROUPS[d.group]) throw new Error(`${name}: unknown group "${d.group}"`);
    return d;
  })
  .sort((a, b) => a.order - b.order);
const bySlug = Object.fromEntries(treatments.map((t) => [t.slug, t]));
for (const t of treatments) for (const r of t.related || []) if (!bySlug[r]) throw new Error(`${t.slug}: related "${r}" not found`);

// Generated lists, used by partials and pages as {{LIST:kind:group}}.
const inGroup = (g) => treatments.filter((t) => t.group === g);
const LISTS = {
  menu: (g) => inGroup(g).map((t) => `<a href="/${t.slug}">${t.name}</a>`).join("\n"),
  mnav: (g) => inGroup(g).map((t) => `<a href="/${t.slug}">${t.name}</a>`).join(""),
  foot: (g) => inGroup(g).map((t) => `<a href="/${t.slug}">${t.name}</a>`).join("\n"),
  chips: (g) => inGroup(g).map((t) => `<a href="/${t.slug}" class="chip">${t.name}</a>`).join("\n"),
  count: (g) => String(inGroup(g).length),
  rows: (g) => inGroup(g).map((t) => `<a href="/${t.slug}" class="tx-row"><b>${t.name}</b><span>${t.short}</span></a>`).join("\n"),
};

const includeOnce = (html) =>
  html.replace(/\{\{> *([\w-]+) *\}\}/g, (_, name) => readFileSync(join(PARTIALS, `${name}.html`), "utf8").trim());
const include = (html) => includeOnce(includeOnce(html)); // partials may include partials one level deep
const stampPage = (html) => include(html)
  .replace(/\{\{LIST:(\w+):([\w-]+)\}\}/g, (_, kind, g) => {
    if (!LISTS[kind] || !GROUPS[g]) throw new Error(`Unknown list {{LIST:${kind}:${g}}}`);
    return LISTS[kind](g);
  })
  .replaceAll("{{BUILD}}", String(build))
  .replaceAll("{{YEAR}}", String(new Date().getFullYear()))
  .replaceAll("{{ROBOTS}}", preview ? '<meta name="robots" content="noindex, nofollow">' : "");

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (p === PARTIALS || p === TREATMENTS) continue;
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const out = join(OUT, p.slice(SRC.length + 1));
    mkdirSync(dirname(out), { recursive: true });
    if (p.endsWith(".html")) writeFileSync(out, stampPage(readFileSync(p, "utf8")));
    else copyFileSync(p, out);
  }
}
walk(SRC);

for (const d of treatments) {
  const out = join(OUT, `${d.slug}.html`);
  if (existsSync(out)) throw new Error(`${d.slug}.html exists in src and treatments`);
  writeFileSync(out, stampPage(renderTreatment(d, bySlug)));
}

const pages = readdirSync(OUT).filter((n) => n.endsWith(".html") && n !== "404.html").map((n) => n === "index.html" ? "" : n.slice(0, -5));
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `<url><loc>https://www.occonciergedoctor.com/${p}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(OUT, "version.txt"), `build ${build}\n${stamp}\n`);
writeFileSync(join(OUT, "_headers"), preview ? "/*\n  X-Robots-Tag: noindex, nofollow\n" : "");
writeFileSync(join(OUT, "robots.txt"), preview ? "User-agent: *\nDisallow: /\n" : "User-agent: *\nAllow: /\nSitemap: https://www.occonciergedoctor.com/sitemap.xml\n");
console.log(`Built ${build}${preview ? " (preview, noindex)" : ""}: ${pages.length} pages, ${treatments.length} treatments`);
