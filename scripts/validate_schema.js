#!/usr/bin/env node
const fs = require("fs");

const schema = JSON.parse(fs.readFileSync("schema/normalized.schema.json", "utf8"));

const validate = (obj, idx, file) => {
  if (typeof obj !== "object" || obj === null) {
    console.error("Invalid record in", file, "at", idx);
    process.exit(1);
  }
  if (!obj.name || typeof obj.name !== "string") {
    console.error("Missing or invalid name in", file, "at", idx);
    process.exit(2);
  }
  if (!obj.slug || typeof obj.slug !== "string") {
    console.error("Missing or invalid slug in", file, "at", idx);
    process.exit(3);
  }
};

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node scripts/validate_schema.js <file1.json> <file2.json> ...");
  process.exit(4);
}

files.forEach(file => {
  const raw = fs.readFileSync(file, "utf8");
  let arr;
  try {
    arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw 0;
  } catch {
    console.error("Invalid JSON:", file);
    process.exit(5);
  }
  arr.forEach((obj, i) => validate(obj, i, file));
  console.log("OK", file);
});
