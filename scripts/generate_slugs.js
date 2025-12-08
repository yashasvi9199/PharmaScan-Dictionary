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

const splitCsvLine = line => {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' ) {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; continue; }
      inQ = !inQ;
      continue;
    }
    if (ch === ',' && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim());
};

const parseCSV = txt => {
  const rows = txt.split(/\r?\n/).filter(Boolean);
  if (!rows.length) return [];
  const headers = splitCsvLine(rows[0]).map(h => h.trim());
  let nameIdx = headers.findIndex(h => /name/i.test(h));
  if (nameIdx === -1) {
    nameIdx = headers.findIndex(h => /(title|drug|salt|generic|product)/i.test(h));
  }
  if (nameIdx === -1) nameIdx = 0;
  return rows.slice(1).map(r => {
    const cols = splitCsvLine(r);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i] || ""));
    obj.__name_col = headers[nameIdx];
    obj.__name_idx = nameIdx;
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
const out = arr.map((rec, idx) => {
  let name;
  if (isCsv) {
    // prefer explicit name header if present, else fallback to first column value
    const key = rec.__name_col || Object.keys(rec)[0];
    name = (rec[key] || "").toString().trim();
  } else {
    name = (rec.name || rec.title || rec.product || "").toString().trim();
  }

  if (!name) {
    console.error(`Parse error: CSV must include a 'name' column or first column must contain value (row ${idx + 2}) in ${inPath}`);
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

  const base = Object.assign({}, rec);
  // normalize output shape
  base.name = name;
  base.slug = s;
  if (base.__name_col) delete base.__name_col;
  if (base.__name_idx !== undefined) delete base.__name_idx;
  return base;
});

ensureDir(outPath);
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(`Wrote ${out.length} records to ${outPath}`);
