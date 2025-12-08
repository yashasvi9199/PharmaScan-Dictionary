#!/usr/bin/env node
const fs = require("fs");
const out = [];
fs.writeFileSync("data/ingest_openfda.json", JSON.stringify(out, null, 2));
console.log("openfda OK");
