#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const OUT = "data/out/ocr_variants.normalized.json";
const SALTS = "data/out/salts.normalized.json";
const EXISTING = "data/out/ocr_variants.normalized.json";

const subs = [
  ["0","O"], ["O","0"],
  ["1","l"], ["l","1"],
  ["5","S"], ["S","5"],
  ["2","Z"], ["Z","2"],
  ["8","B"], ["B","8"],
  ["rn","m"], ["m","rn"]
];

const read = p => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p,"utf8")) : []);
const write = (p,j) => { const d = path.dirname(p); if (!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true}); fs.writeFileSync(p, JSON.stringify(j,null,2),"utf8"); };

const salts = read(SALTS);
const existing = read(EXISTING);

const baseNames = new Set(existing.map(r=>r.name));
salts.forEach(s => baseNames.add(s.name));

const variantsMap = new Map();

const addVariant = (key, v) => {
  if (!variantsMap.has(key)) variantsMap.set(key, new Set());
  variantsMap.get(key).add(v);
};

const generateVariantsFor = name => {
  const out = new Set();
  out.add(name);
  const q = [name];
  while (q.length) {
    const cur = q.shift();
    for (const [a,b] of subs) {
      if (cur.includes(a)) {
        const next = cur.split(a).join(b);
        if (!out.has(next)) { out.add(next); q.push(next); }
      }
    }
  }
  return Array.from(out);
};

baseNames.forEach(name => {
  const vs = generateVariantsFor(name);
  vs.forEach(v => addVariant(name, v));
});

const result = [];
for (const [name, setV] of variantsMap.entries()) {
  const arr = Array.from(setV);
  result.push({ name, variants: arr, slug: arr[0].toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"") });
}

write(OUT, result);
console.log("OK", OUT);
