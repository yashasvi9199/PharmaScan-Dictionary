#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";

type In = { [k: string]: any; name?: string };
type Out = In & { slug: string };

const slugify = (s: string) =>
  s.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 128);

const parseCSV = (txt: string): In[] => {
  const rows = txt.split(/\r?\n/).filter(Boolean);
  const headers = rows[0].split(",");
  const nameIdx = headers.findIndex(h => h.trim().toLowerCase() === "name");
  if (nameIdx === -1) throw new Error("CSV must include a 'name' column");
  return rows.slice(1).map(r => {
    const cols = r.split(",");
    const o: In = {};
    headers.forEach((h, i) => (o[h] = cols[i] || ""));
    return o;
  });
};

const ensureDir = (p: string) => {
  const d = path.dirname(p);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
};

const main = () => {
  const [inPath, outPath, flag] = process.argv.slice(2);
  if (!inPath || !outPath) process.exit(1);

  const csv = flag === "--csv" || inPath.endsWith(".csv");
  const raw = fs.readFileSync(inPath, "utf8");

  let arr: In[] = csv ? parseCSV(raw) : JSON.parse(raw);
  const seen = new Map<string, number>();

  const out: Out[] = arr.map(r => {
    const base = (r.name || "").toString().trim();
    if (!base) throw new Error("Missing name");
    let s = slugify(base);
    if (seen.has(s)) {
      const n = (seen.get(s) || 1) + 1;
      seen.set(s, n);
      s = `${s}-${n}`;
    } else {
      seen.set(s, 1);
    }
    return { ...r, slug: s };
  });

  ensureDir(outPath);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`OK ${out.length}`);
};

main();
