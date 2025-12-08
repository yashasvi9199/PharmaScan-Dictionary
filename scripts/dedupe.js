#!/usr/bin/env node
// Aggressive dedupe for dictionary build (CommonJS). May be useful for other purposes.

const fs = require("fs");
const IN = "data/ingested_combined.json";
const OUT = "data/deduped.json";

const REPLACEMENTS = [
  ["hydrochloride", "hcl"],
  ["sulfate", "sulphate"],
  ["acetate", "ace"],
  ["monohydrate", ""],
  ["anhydrous", ""],
  ["sodium", "na"],
  ["potassium", "k"],
];

function normName(n) {
  return String(n || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\b(tablet|capsule|solution|suspension|injection|oral|extended|release|tablet|film|cream)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyReplacements(s) {
  let out = s;
  for (const [a, b] of REPLACEMENTS) {
    const reA = new RegExp(`\\b${a}\\b`, "g");
    const reB = new RegExp(`\\b${b}\\b`, "g");
    out = out.replace(reA, b).replace(reB, b);
  }
  return out.replace(/\s+/g, " ").trim();
}

function tokens(s) {
  if (!s) return [];
  return applyReplacements(normName(s)).split(" ").filter(Boolean);
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size && !B.size) return 1;
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : inter / union;
}

function chooseCanonical(existing, candidate) {
  // prefer one with atc code, then shorter, then one with more sources
  if (existing.atc && !candidate.atc) return existing;
  if (!existing.atc && candidate.atc) return candidate;
  if ((existing.names || []).length !== (candidate.names || []).length) {
    return (existing.names || []).length > (candidate.names || []).length ? existing : candidate;
  }
  return String(existing.slug || "").length <= String(candidate.slug || "").length ? existing : candidate;
}

function mergeEntries(a, b) {
  const names = Array.from(new Set([...(a.names||[]), ...(b.names||[])]));
  const sources = Array.from(new Set([...(a.sources||[]), ...(b.sources||[])]));
  const raws = Array.isArray(a.raws) || Array.isArray(b.raws) ? [...(a.raws||[]), ...(b.raws||[])] : (a.raws||b.raws||[]);
  const atc = a.atc || b.atc || null;
  const slug = a.slug || b.slug;
  const canonical = chooseCanonical(a, b);
  return {
    slug,
    names,
    sources,
    raws,
    atc,
    canonical_name: (canonical.names && canonical.names[0]) || (names[0] || null)
  };
}

function run() {
  if (!fs.existsSync(IN)) {
    console.error("missing", IN);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(IN, "utf8") || "[]");
  const buckets = []; // array of merged entries

  for (const item of raw) {
    const itemNames = (item.names && item.names.length) ? item.names : [item.slug];
    const itemTokens = tokens(itemNames[0] || item.slug);
    let placed = false;

    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i];
      // fast check: same atc strongly indicates same
      if (item.atc && b.atc && item.atc === b.atc) {
        buckets[i] = mergeEntries(b, item);
        placed = true;
        break;
      }
      // compare against canonical name and name list
      const bTokens = tokens((b.canonical_name || b.names && b.names[0] || b.slug));
      const sim = jaccard(itemTokens, bTokens);

      if (sim >= 0.65) { // similarity threshold for aggressive mode
        buckets[i] = mergeEntries(b, item);
        placed = true;
        break;
      }

      // cross-compare with each name in b.names (catch variants)
      if (b.names) {
        for (const bn of b.names) {
          const bnTok = tokens(bn);
          if (jaccard(itemTokens, bnTok) >= 0.75) {
            buckets[i] = mergeEntries(b, item);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }

    if (!placed) {
      buckets.push({
        slug: item.slug || applyReplacements(normName(itemNames[0] || "")) || item.slug,
        names: Array.from(new Set(itemNames)),
        sources: item.sources ? (Array.isArray(item.sources) ? item.sources : [item.sources]) : [item.source || "unknown"],
        raws: item.raws ? (Array.isArray(item.raws) ? item.raws : [item.raws]) : (item.raw ? [item.raw] : []),
        atc: item.atc || null,
        canonical_name: itemNames[0] || item.slug
      });
    }
  }

  // final pass: normalize canonical names and slugs
  const out = buckets.map(b => {
    const canonical = b.canonical_name || b.names[0] || b.slug;
    const finalSlug = (b.slug && b.slug.length) ? b.slug : applyReplacements(normName(canonical)).replace(/\s+/g, "-");
    return {
      slug: finalSlug,
      canonical_name: canonical,
      names: b.names,
      sources: b.sources,
      atc: b.atc,
      raws: b.raws
    };
  });

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log("dedupe OK —", out.length, "entries");
  return out.length;
}

if (require.main === module) run();
module.exports = { run };
