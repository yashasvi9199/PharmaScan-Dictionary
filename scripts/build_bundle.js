#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const IN = "data/deduped_clean_final.json";
const OUT = "dist/dictionary.bundle.json";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function run() {
  if (!fs.existsSync(IN)) {
    console.error("Missing:", IN);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(IN, "utf8"));
  const out = [];
  const seen = new Set();

  for (const it of raw) {
    const slug = it.slug || null;
    const canonical = it.canonical_name || null;
    if (!slug || !canonical) continue;

    if (seen.has(slug)) continue;
    seen.add(slug);

    out.push({
      slug,
      canonical,
      names: it.names || [],
      atc: it.atc || null
    });
  }

  ensureDir("dist");
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log("Bundle OK —", out.length, "entries");
  return out.length;
}

if (require.main === module) run();

module.exports = { run };
