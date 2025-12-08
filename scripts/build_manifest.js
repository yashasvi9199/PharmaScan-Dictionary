#!/usr/bin/env node
const fs = require("fs");

const out = fs.readdirSync("data/out").filter(f =>
  f.endsWith(".json") || f.endsWith(".sha256")
);

const manifest = {
  files: out.sort(),
  generated_at: new Date().toISOString()
};

fs.writeFileSync("data/out/manifest.json", JSON.stringify(manifest, null, 2));
console.log("OK manifest.json");
