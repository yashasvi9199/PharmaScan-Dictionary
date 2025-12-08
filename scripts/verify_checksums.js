#!/usr/bin/env node
const fs = require("fs");
const crypto = require("crypto");
const dir = "data/out";

const files = fs.readdirSync(dir).filter(f => f.endsWith(".sha256"));

for (const shaFile of files) {
  const target = shaFile.replace(".sha256", "");
  const targetPath = `${dir}/${target}`;
  const shaPath = `${dir}/${shaFile}`;

  if (!fs.existsSync(targetPath)) {
    console.error("Missing:", targetPath);
    process.exit(1);
  }

  const expected = fs.readFileSync(shaPath, "utf8").split(/\s+/)[0].trim();
  const buf = fs.readFileSync(targetPath);
  const actual = crypto.createHash("sha256").update(buf).digest("hex");

  if (expected !== actual) {
    console.error("FAIL", target);
    process.exit(2);
  }

  console.log("OK", target);
}
