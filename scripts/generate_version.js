#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const OUT = "dist/version.json";

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function run() {
  const version = process.env.DICT_VERSION || "0.1.0";
  const now = new Date().toISOString();

  const data = {
    version,
    generated_at: now
  };

  ensureDir("dist");
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
  console.log("version file written:", OUT);
}

if (require.main === module) run();
module.exports = { run };
