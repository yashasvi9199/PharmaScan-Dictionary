#!/usr/bin/env node
// Pass1-3 cleaner: CommonJS. Input defaults to data/deduped.json, output -> data/deduped_clean_final.json

const fs = require('fs');
const path = require('path');

const IN = process.env.DEDUPED_IN || 'data/deduped.json';
const OUT = process.env.DEDUPED_OUT || 'data/deduped_clean_final.json';

const REPLACEMENTS = [
  ['hydrochloride','hcl'],
  ['sulfate','sulphate'],
  ['monohydrate',''],
  ['anhydrous',''],
  ['sodium','na'],
  ['potassium','k'],
  ['chloride','cl']
];

const DOSAGE = new Set([
  'tablet','tablets','capsule','capsules','solution','suspension','injection','oral','extended','release',
  'film','cream','ointment','gel','powder','spray','drops','suppository','lotion','ampoule','vial'
]);

const BANNED_FIRST = new Set(['active','other','drug','drugs','combination','combinations','unknown']);

function norm_text(s){
  if(!s) return '';
  s = String(s).trim().toLowerCase();
  s = s.replace(/\(.*?\)/g,' ');
  const toks = s.split(/[\s,\/\-\._]+/).filter(Boolean).filter(t => !DOSAGE.has(t));
  let out = toks.join(' ');
  for(const [a,b] of REPLACEMENTS) out = out.replace(new RegExp('\\b'+a+'\\b','g'), b);
  out = out.replace(/[^a-z0-9\s-]/g,' ');
  out = out.replace(/\s+/g,' ').trim();
  return out;
}

function slugify(s){
  return norm_text(s).replace(/\s+/g,'-').replace(/-+/g,'-');
}

function readJSON(p){
  if(!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p,'utf8')||'[]'); } catch(e){ return []; }
}

// PASS1: remove garbage entries
function pass1(items){
  return items.filter(it=>{
    const cn = (it.canonical_name|| (it.names && it.names[0]) || it.slug || '').toString().trim().toLowerCase();
    const first = cn.split(/\s+/)[0]||'';
    if(!cn) return false;
    if(BANNED_FIRST.has(first) || BANNED_FIRST.has(cn)) return false;
    // if canonical_name is a single token like 'active' drop
    if(cn.length < 3) return false;
    return true;
  });
}

// PASS2: normalize names and canonical
function pass2(items){
  const out = items.map(it=>{
    const names = Array.isArray(it.names) ? it.names : [];
    const normNames = [];
    for(const n of names){
      const nn = norm_text(n);
      if(nn) normNames.push(nn);
    }
    const cnRaw = it.canonical_name || (names[0]||it.slug||'');
    const cn = norm_text(cnRaw);
    if(cn && !normNames.includes(cn)) normNames.unshift(cn);
    const uniq = Array.from(new Set(normNames));
    const slug = slugify(uniq[0] || it.slug || cn);
    return {
      slug,
      canonical_name: uniq[0] || cn || slug,
      names: uniq,
      sources: it.sources || [],
      atc: it.atc || null,
      raws: it.raws || []
    };
  });
  return out;
}

// PASS3: ATC merge & final dedupe
function pass3(items){
  const byAtc = {};
  const noAtc = [];
  for(const it of items){
    if(it.atc){
      byAtc[it.atc] = byAtc[it.atc] || [];
      byAtc[it.atc].push(it);
    } else noAtc.push(it);
  }
  const merged = [];
  for(const code of Object.keys(byAtc)){
    const grp = byAtc[code];
    const freq = {};
    const sources = new Set();
    const raws = [];
    for(const it of grp){
      for(const n of it.names||[]) freq[n]=(freq[n]||0)+1;
      (it.sources||[]).forEach(s=>sources.add(s));
      raws.push(...(it.raws||[]));
    }
    const common = Object.keys(freq).sort((a,b)=>freq[b]-freq[a] || a.length-b.length)[0] || (grp[0] && grp[0].canonical_name) || '';
    const names = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]);
    merged.push({
      slug: slugify(common),
      canonical_name: common,
      names: names.length ? names : [common],
      sources: Array.from(sources),
      atc: code,
      raws
    });
  }
  // combine merged + noAtc, then final dedupe by slug
  const all = merged.concat(noAtc);
  const map = new Map();
  for(const it of all){
    const s = it.slug || slugify(it.canonical_name || (it.names&&it.names[0]) || '');
    if(!s) continue;
    if(map.has(s)){
      const ex = map.get(s);
      ex.names = Array.from(new Set(ex.names.concat(it.names||[])));
      ex.sources = Array.from(new Set(ex.sources.concat(it.sources||[])));
      ex.raws = ex.raws.concat(it.raws||[]);
      if(!ex.atc && it.atc) ex.atc = it.atc;
      if(!ex.canonical_name) ex.canonical_name = it.canonical_name;
    } else {
      map.set(s, Object.assign({}, it, {slug: s}));
    }
  }
  return Array.from(map.values());
}

// runner
function run(){
  const inItems = readJSON(IN);
  console.log('IN:', IN, 'count=', inItems.length);
  const p1 = pass1(inItems);
  console.log('PASS1 ->', p1.length);
  const p2 = pass2(p1);
  console.log('PASS2 ->', p2.length);
  const p3 = pass3(p2);
  console.log('PASS3 ->', p3.length);
  fs.writeFileSync(OUT, JSON.stringify(p3, null, 2), 'utf8');
  console.log('wrote', OUT);
  return p3.length;
}

if(require.main === module) run();
module.exports = { run };
