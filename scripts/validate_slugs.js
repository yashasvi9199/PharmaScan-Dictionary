#!/usr/bin/env node
const fs = require("fs");

const check = file => {
  if (!fs.existsSync(file)) {
    console.error("Missing file:", file);
    process.exit(1);
  }

  let arr;
  try {
    arr = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error("Invalid JSON:", file);
    process.exit(2);
  }

  const seen = new Set();

  arr.forEach((r, i) => {
    if (!r.name || !r.slug) {
      console.error(`Invalid record in ${file} at index ${i}`);
      process.exit(3);
    }
    if (seen.has(r.slug)) {
      console.error(`Duplicate slug '${r.slug}' in ${file}`);
      process.exit(4);
    }
    seen.add(r.slug);
  });

  console.log(`OK: ${file}`);
};

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node scripts/validate_slugs.js <file1.json> <file2.json> ...");
  process.exit(5);
}

files.forEach(check);
