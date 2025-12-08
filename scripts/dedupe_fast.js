#!/usr/bin/env node
// faster dedupe: slug -> atc -> small-bucket fuzzy. CommonJS.

const fs = require("fs");
const IN = "data/ingested_combined.json";
const OUT = "data/deduped.json";

function slugify(s){ return String(s||"").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g," ").replace(/\s+/g," ").trim(); }
function normName(n){ return slugify(n).replace(/\b(tablet|capsule|solution|suspension|injection|oral|release|cream)\b/g,"").replace(/\s+/g," ").trim(); }
function tokens(s){ return (s||"").split(/\s+/).filter(Boolean); }

function jaccard(a,b){
  const A=new Set(a), B=new Set(b);
  const inter=[...A].filter(x=>B.has(x)).length;
  const union=new Set([...A,...B]).size;
  return union?inter/union:0;
}

function merge(a,b){
  return {
    slug: a.slug || b.slug,
    names: Array.from(new Set([...(a.names||[]), ...(b.names||[])])),
    sources: Array.from(new Set([...(a.sources||[]), ...(b.sources||[])])),
    raws: [...(a.raws||[]), ...(b.raws||[])],
    atc: a.atc || b.atc || null,
    canonical_name: (a.canonical_name || b.canonical_name || (a.names&&a.names[0]) || (b.names&&b.names[0]) || null)
  };
}

function run(){
  if(!fs.existsSync(IN)){ console.error("missing",IN); process.exit(1); }
  const raw = JSON.parse(fs.readFileSync(IN,"utf8")||"[]");

  // 1) exact slug merge
  const bySlug = new Map();
  const rest = [];
  for(const it of raw){
    const slug = it.slug || normName(it.names && it.names[0] || "");
    if(!slug){ rest.push(it); continue; }
    if(bySlug.has(slug)){
      bySlug.set(slug, merge(bySlug.get(slug), it));
    } else {
      bySlug.set(slug, Object.assign({}, it));
    }
  }

  // 2) group remaining (those with unique slugs that didn't merge above)
  // but first collect items that were unique by slug in raw: we already merged all bySlug
  const mergedInitial = Array.from(bySlug.values());

  // 3) merge by ATC within mergedInitial: group by atc and collapse each group
  const byAtc = new Map();
  const noAtc = [];
  for(const it of mergedInitial){
    if(it.atc){
      if(!byAtc.has(it.atc)) byAtc.set(it.atc, it);
      else byAtc.set(it.atc, merge(byAtc.get(it.atc), it));
    } else {
      noAtc.push(it);
    }
  }

  // 4) fuzzy merge inside small buckets for noAtc items
  // bucket by first token to limit comparisons
  const buckets = new Map();
  for(const it of noAtc){
    const name = (it.canonical_name || it.names && it.names[0] || "");
    const tok = tokens(normName(name))[0] || "__";
    if(!buckets.has(tok)) buckets.set(tok, []);
    buckets.get(tok).push(it);
  }

  const final = [];
  // add all atc-merged entries
  for(const v of byAtc.values()) final.push(v);

  // process buckets
  for(const [k, arr] of buckets.entries()){
    const merged = [];
    for(const item of arr){
      const itTok = tokens(normName(item.canonical_name || item.names && item.names[0] || ""));
      let placed = false;
      for(let i=0;i<merged.length;i++){
        const cand = merged[i];
        const candTok = tokens(normName(cand.canonical_name || cand.names && cand.names[0] || ""));
        const sim = jaccard(itTok, candTok);
        if(sim >= 0.72){
          merged[i] = merge(cand, item);
          placed = true;
          break;
        }
      }
      if(!placed) merged.push(item);
    }
    for(const m of merged) final.push(m);
  }

  // finalize slugs and canonical names
  const out = final.map(f=>{
    const canonical = f.canonical_name || (f.names && f.names[0]) || "";
    const finalSlug = (f.slug && f.slug.length)? f.slug : slugify(canonical);
    return {
      slug: finalSlug,
      canonical_name: canonical,
      names: f.names,
      sources: f.sources,
      atc: f.atc || null,
      raws: f.raws || []
    };
  });

  fs.writeFileSync(OUT, JSON.stringify(out,null,2),"utf8");
  console.log("dedupe OK —", out.length, "entries");
  return out.length;
}

if(require.main===module) run();
module.exports={run};
