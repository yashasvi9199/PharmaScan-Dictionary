#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const slugify = s =>
  String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 128);

const parseCSV = txt => {
  const rows = txt.split(/\r?\n/).filter(Boolean);
  const headers = rows[0].split(",").map(h => h.trim());
  const nameIdx = headers.findIndex(h => h.toLowerCase() === "name");
  if (nameIdx === -1) throw new Error("CSV must include a 'name' column");
  return rows.slice(1).map(r => {
    const cols = r.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i] || ""));
    return obj;
  });
};

const ensureDir = p => {
  const d = path.dirname(p);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
};

const [inPath, outPath, flag] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error("Usage: node scripts/generate_slugs.js <in> <out> [--csv]");
  process.exit(1);
}

const isCsv = flag === "--csv" || inPath.toLowerCase().endsWith(".csv");
if (!fs.existsSync(inPath)) {
  console.error("Input not found:", inPath);
  process.exit(2);
}

let raw = fs.readFileSync(inPath, "utf8");
let arr;
try {
  arr = isCsv ? parseCSV(raw) : JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error("Input must be an array");
} catch (e) {
  console.error("Parse error:", e.message || e);
  process.exit(3);
}

const seen = new Map();
const out = arr.map(rec => {
  const name = (rec.name || "").toString().trim();
  if (!name) {
    console.error("Record missing 'name' field");
    process.exit(4);
  }
  let s = slugify(name);
  if (seen.has(s)) {
    const n = (seen.get(s) || 1) + 1;
    seen.set(s, n);
    s = `${s}-${n}`;
  } else {
    seen.set(s, 1);
  }
  return Object.assign({}, rec, { name, slug: s });
});

ensureDir(outPath);
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(`Wrote ${out.length} records to ${outPath}`);
