#!/usr/bin/env node
const fs = require("fs");
const out = [];
fs.writeFileSync("data/ingest_atc.json", JSON.stringify(out, null, 2));
console.log("atc OK");
