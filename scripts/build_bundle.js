#!/usr/bin/env node
const fs = require("fs");

const files = {
  salts: "data/out/salts.normalized.json",
  forms: "data/out/forms.normalized.json",
  units: "data/out/units.normalized.json",
  ocr_variants: "data/out/ocr_variants.normalized.json"
};

const out = {};

for (const key in files) {
  const fp = files[key];
  if (!fs.existsSync(fp)) {
    console.error("Missing", fp);
    process.exit(1);
  }
  out[key] = JSON.parse(fs.readFileSync(fp, "utf8"));
}

fs.writeFileSync("data/out/dictionary.bundle.json", JSON.stringify(out, null, 2));
console.log("OK dictionary.bundle.json");
