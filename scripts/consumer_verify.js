#!/usr/bin/env node
const fs = require("fs");
const crypto = require("crypto");

const file = process.argv[2];
const shaFile = file + ".sha256";

if (!fs.existsSync(file) || !fs.existsSync(shaFile)) {
  console.error("Missing file or checksum");
  process.exit(1);
}

const expected = fs.readFileSync(shaFile, "utf8").split(/\s+/)[0].trim();
const buf = fs.readFileSync(file);
const actual = crypto.createHash("sha256").update(buf).digest("hex");

if (expected !== actual) {
  console.error("FAIL", file);
  process.exit(2);
}

console.log("OK", file);
