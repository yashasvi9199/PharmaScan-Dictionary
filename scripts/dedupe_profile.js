#!/usr/bin/env node
// Lightweight profiler for dedupe pipeline (CommonJS).

const fs = require("fs");
const IN = "data/ingested_combined.json";
const SAMPLE_OUT = "data/deduped_sample.json";

function now() { return Date.now(); }
function slugify(s){ return String(s||"").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g," ").replace(/\s+/g," ").trim(); }
function tokens(s){ return slugify(s).split(/\s+/).filter(Boolean); }
function memMB(){ return Math.round(process.memoryUsage().heapUsed/1024/1024); }

if(!fs.existsSync(IN)){ console.error("missing",IN); process.exit(1); }

console.log("reading", IN);
const t0 = now();
const rawTxt = fs.readFileSync(IN, "utf8");
console.log("read bytes:", rawTxt.length, "elapsed(ms):", now()-t0, "memMB:", memMB());

let arr;
try {
  arr = JSON.parse(rawTxt);
} catch (e) {
  console.error("json parse failed:", e.message);
  process.exit(1);
}
console.log("parsed items:", arr.length, "elapsed(ms):", now()-t0, "memMB:", memMB());

console.time("group-slug");
const bySlug = new Map();
for (const it of arr) {
  const s = it.slug || (it.names && it.names[0]) || "";
  const key = slugify(s) || "__NO_SLUG__";
  if (!bySlug.has(key)) bySlug.set(key, {count:0, sample:it, items:[]});
  const b = bySlug.get(key);
  b.count++;
  if (b.items.length < 3) b.items.push(it);
}
console.timeEnd("group-slug");
console.log("distinct slugs:", bySlug.size, "top-5 slug counts:");
const topSlugs = Array.from(bySlug.entries()).sort((a,b)=>b[1].count-a[1].count).slice(0,5);
for (const [k,v] of topSlugs) console.log(k, v.count);

console.time("group-atc");
const byAtc = new Map();
let atcCount = 0;
for (const it of arr) {
  if (it.atc) {
    atcCount++;
    if (!byAtc.has(it.atc)) byAtc.set(it.atc, {count:0, sample:it});
    byAtc.get(it.atc).count++;
  }
}
console.timeEnd("group-atc");
console.log("items with ATC:", atcCount, "distinct ATC codes:", byAtc.size, "top-5 ATC:");
Array.from(byAtc.entries()).sort((a,b)=>b[1].count-a[1].count).slice(0,5).forEach(([k,v])=>console.log(k,v.count));

console.time("token-index");
const tokenMap = new Map();
for (const it of arr) {
  const name = (it.names && it.names[0]) || it.slug || "";
  const toks = tokens(name);
  const first = toks[0] || "__";
  tokenMap.set(first, (tokenMap.get(first)||0)+1);
}
console.timeEnd("token-index");
console.log("token buckets:", tokenMap.size, "top-10 tokens:");
Array.from(tokenMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(x=>console.log(x[0],x[1]));

console.time("find-large-raws");
const rawsLength = arr.map(it => {
  const r = it.raws || it.raw || {};
  return JSON.stringify(r).length;
});
const sorted = rawsLength.slice().sort((a,b)=>b-a);
console.timeEnd("find-large-raws");
console.log("raw max/min (chars):", sorted[0]||0, sorted[sorted.length-1]||0, "median approx:", sorted[Math.floor(sorted.length/2)]||0);

console.log("memory after indexing (MB):", memMB());

console.time("generate-sample-dedupe");
const sample = [];
// quick sample dedupe: collapse exact slug only
for (const [k,v] of bySlug.entries()) {
  const item = v.sample;
  sample.push({
    slug: k,
    canonical_name: (item.names && item.names[0]) || item.slug || "",
    names: item.names || [],
    atc: item.atc || null,
    sources: item.sources || [item.source || "unknown"]
  });
  if (sample.length >= 1000) break;
}
fs.writeFileSync(SAMPLE_OUT, JSON.stringify(sample, null, 2), "utf8");
console.timeEnd("generate-sample-dedupe");
console.log("wrote sample", SAMPLE_OUT, "items:", sample.length, "elapsed total(ms):", now()-t0, "memMB:", memMB());

console.log("profiling complete. Paste the console output here.");
