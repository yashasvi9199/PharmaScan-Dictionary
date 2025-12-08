#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const IN = "data/atc.csv";
const OUT = "data/ingest_atc.json";

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseCSV(raw) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const out = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map(x => x.trim().replace(/^"|"$/g, ""));
    if (row.length < 2) continue;

    const code = row[0];
    const name = row[1];
    if (!code || !name) continue;

    out.push({
      slug: slugify(name),
      names: [name],
      atc: code,
      source: "who-atc",
      raw: { code, name }
    });
  }
  return out;
}

async function run() {
  if (!fs.existsSync(IN)) {
    console.error("ATC CSV missing:", IN);
    process.exit(1);
  }

  const raw = fs.readFileSync(IN, "utf8");
  const parsed = parseCSV(raw);

  fs.writeFileSync(OUT, JSON.stringify(parsed, null, 2));
  console.log("ATC OK —", parsed.length, "entries");

  return parsed.length;
}

if (require.main === module) run();

module.exports = { run };
