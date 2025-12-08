#!/usr/bin/env node

const fs = require("fs");
const crypto = require("crypto");

const IN = "dist/dictionary.bundle.json";
const OUT = "dist/dictionary.bundle.json.sha256";

function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function run() {
  if (!fs.existsSync(IN)) {
    console.error("Missing:", IN);
    process.exit(1);
  }

  const buf = fs.readFileSync(IN);
  const hash = sha256(buf);

  fs.writeFileSync(OUT, hash + "\n");
  console.log("sha256 OK:", OUT);
  console.log(hash);
}

if (require.main === module) run();
module.exports = { run };
