#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dir = process.argv[2] || "data/out";
if (!fs.existsSync(dir)) {
  console.error("Dir not found:", dir);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
if (!files.length) {
  console.error("No .json files in", dir);
  process.exit(2);
}

for (const f of files) {
  const full = path.join(dir, f);
  const buf = fs.readFileSync(full);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  const outPath = full + ".sha256";
  fs.writeFileSync(outPath, `${hash}  ${f}\n`, "utf8");
  console.log("Wrote", outPath);
}
