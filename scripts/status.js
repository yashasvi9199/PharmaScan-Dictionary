#!/usr/bin/env node
const fs = require("fs");

const required = [
  "data/out/salts.normalized.json",
  "data/out/forms.normalized.json",
  "data/out/units.normalized.json",
  "data/out/ocr_variants.normalized.json",
  "data/out/dictionary.bundle.json"
];

for (const f of required) {
  if (!fs.existsSync(f)) {
    console.error("MISSING", f);
    process.exit(1);
  }
}

console.log("OK normalization");
