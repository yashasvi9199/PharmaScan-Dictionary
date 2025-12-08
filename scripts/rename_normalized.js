#!/usr/bin/env node
const fs = require("fs");

const mapping = [
  ["salts.with-slugs.json", "salts.normalized.json"],
  ["forms.with-slugs.json", "forms.normalized.json"],
  ["units.with-slugs.json", "units.normalized.json"],
  ["ocr_variants.with-slugs.json", "ocr_variants.normalized.json"]
];

mapping.forEach(([oldf, newf]) => {
  const src = `data/out/${oldf}`;
  const dst = `data/out/${newf}`;
  if (fs.existsSync(src)) fs.renameSync(src, dst);
  console.log("OK", dst);
});
