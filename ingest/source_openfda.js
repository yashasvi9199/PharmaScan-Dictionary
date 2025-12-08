const fs = require("fs/promises");

const OUT_PATH = "data/ingest_openfda.json";
const BASE_URL = "https://api.fda.gov/drug/label.json";
const LIMIT = 100;
const MAX = 5000;

const slugify = s =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const extractNames = r => {
  const of = r.openfda || {};
  const s = new Set();
  ["substance_name", "brand_name", "generic_name"].forEach(k => {
    if (Array.isArray(of[k])) of[k].forEach(x => x && s.add(x));
  });
  ["generic_name", "brand_name", "substance_name", "active_ingredient", "purpose"].forEach(k => {
    const v = r[k];
    if (!v) return;
    if (Array.isArray(v)) v.forEach(x => x && s.add(x));
    else s.add(v);
  });
  const out = new Set();
  for (const n of s) {
    String(n)
      .split(/[,;/]| and /i)
      .map(x => x.trim())
      .filter(Boolean)
      .forEach(p => out.add(p));
  }
  return Array.from(out);
};

async function fetchPage(skip = 0) {
  const url = `${BASE_URL}?limit=${LIMIT}&skip=${skip}`;
  const res = await fetch(url, { headers: { "User-Agent": "pharmascan-dict/1.0" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.results || [];
}

async function run() {
  const items = [];
  let skip = 0;
  let fetched = 0;
  while (true) {
    const page = await fetchPage(skip).catch(() => []);
    if (!page.length) break;
    for (const r of page) {
      const names = extractNames(r);
      if (!names.length) continue;
      items.push({
        slug: slugify(names[0]),
        names,
        source: "openfda",
        raw: { id: r.id || null }
      });
    }
    fetched += page.length;
    skip += LIMIT;
    if (fetched >= MAX) break;
    await new Promise(r => setTimeout(r, 250));
  }
  const map = new Map();
  for (const it of items) {
    if (!map.has(it.slug)) map.set(it.slug, it);
    else {
      const ex = map.get(it.slug);
      ex.names = Array.from(new Set([...ex.names, ...it.names]));
    }
  }
  const out = Array.from(map.values());
  await fs.writeFile(OUT_PATH, JSON.stringify(out, null, 2), "utf8");
  return out.length;
}

if (process.argv[1] && /source_openfda\.js$/.test(process.argv[1])) {
  run().then(n => console.log("wrote", n, "entries")).catch(e => {
    console.error("error", e.message);
    process.exit(1);
  });
}

if (require.main === module) run();
module.exports = { run };