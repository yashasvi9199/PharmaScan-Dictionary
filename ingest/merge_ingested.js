const fs =  require("fs/promises");
const path = require("path");

const IN_DIR = "data";
const OUT = "data/ingested_combined.json";

const slugify = s =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

async function load(fp) {
  try {
    return JSON.parse(await fs.readFile(fp, "utf8"));
  } catch {
    return [];
  }
}

async function run() {
  const files = (await fs.readdir(IN_DIR)).filter(f => /^ingest_.*\.json$/.test(f));
  const map = new Map();

  for (const f of files) {
    const arr = await load(path.join(IN_DIR, f));
    for (const it of arr) {
      const names = Array.isArray(it.names) ? it.names : [];
      const primary = names[0] || it.slug || "";
      const slug = slugify(it.slug || primary);
      if (!slug) continue;

      if (!map.has(slug)) {
        map.set(slug, {
          slug,
          names: Array.from(new Set(names)),
          sources: [it.source || f],
          raws: it.raw ? [it.raw] : []
        });
      } else {
        const ex = map.get(slug);
        ex.names = Array.from(new Set([...ex.names, ...names]));
        if (it.source) ex.sources.push(it.source);
        if (it.raw) ex.raws.push(it.raw);
      }
    }
  }

  const out = Array.from(map.values());
  await fs.writeFile(OUT, JSON.stringify(out, null, 2), "utf8");
  return out.length;
}

if (process.argv[1]?.endsWith("merge_ingested.js")) {
  run().then(n => console.log("merged", n)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
if (require.main === module) run();
module.exports = { run };
