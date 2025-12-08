const fs = require("fs/promises");
const path = require("path");

const IN_DIR = "data";
const OUT_PATH = path.join(IN_DIR, "ingested_combined.json");

const slugify = s =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

async function readIngestFiles() {
  const names = await fs.readdir(IN_DIR);
  return names.filter(n => /^ingest_.*\.json$/.test(n)).map(n => path.join(IN_DIR, n));
}

async function loadFile(fp) {
  try {
    const txt = await fs.readFile(fp, "utf8");
    return JSON.parse(txt || "[]");
  } catch {
    return [];
  }
}

async function run() {
  const files = await readIngestFiles();
  const acc = new Map();

  for (const f of files) {
    const arr = await loadFile(f);
    if (!Array.isArray(arr)) continue;
    for (const it of arr) {
      const names = Array.isArray(it.names) ? it.names : [];
      const primary = names[0] || it.slug || names.find(Boolean) || "";
      const slug = slugify(it.slug || primary || names[0] || "");
      if (!slug) continue;

      const entry = {
        slug,
        names: Array.from(new Set(names)),
        sources: new Set([it.source || path.basename(f)]),
        raws: it.raw ? [it.raw] : [],
        atc: it.atc || (it.raw && it.raw.code) || null
      };

      if (!acc.has(slug)) {
        acc.set(slug, entry);
        continue;
      }
      const cur = acc.get(slug);
      cur.names = Array.from(new Set([...cur.names, ...names]));
      if (it.source) cur.sources.add(it.source);
      if (it.raw) cur.raws.push(it.raw);
      if (!cur.atc && (it.atc || (it.raw && it.raw.code))) {
        cur.atc = it.atc || (it.raw && it.raw.code) || null;
      }
    }
  }

  const out = Array.from(acc.values()).map(v => ({
    slug: v.slug,
    names: v.names,
    sources: Array.from(v.sources),
    raws: v.raws,
    atc: v.atc || null
  }));

  await fs.writeFile(OUT_PATH, JSON.stringify(out, null, 2), "utf8");
  return out.length;
}

if (require.main === module) {
  run()
    .then(n => console.log("merged", n, "entries"))
    .catch(e => {
      console.error("error", e.message || e);
      process.exit(1);
    });
}

module.exports = { run };
