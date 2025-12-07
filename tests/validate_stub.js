// tests/validate_stub.js
// Minimal validation stub for CI/local runs using plain Node.
// Usage: node tests/validate_stub.js

const fs = require("fs");
const path = require("path");

const files = [
  "data/salts.csv",
  "data/forms.csv",
  "data/units.csv",
  "data/ocr_variants.csv",
];

let failed = false;

for (const f of files) {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) {
    console.error(`MISSING: ${f}`);
    failed = true;
    continue;
  }
  const stat = fs.statSync(p);
  if (stat.size === 0) {
    console.error(`EMPTY: ${f}`);
    failed = true;
    continue;
  }
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length < 1) {
    console.error(`NO_ROWS: ${f}`);
    failed = true;
    continue;
  }
  console.log(`${f}: OK — ${lines.length} lines`);
}

if (failed) {
  console.error("Validation failed.");
  process.exit(2);
}
console.log("Basic validation passed.");
process.exit(0);
