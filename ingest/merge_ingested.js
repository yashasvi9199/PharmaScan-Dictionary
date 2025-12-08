#!/usr/bin/env node
const fs = require("fs");
const out = {
  openfda: JSON.parse(fs.readFileSync("data/ingest_openfda.json", "utf8")),
  atc: JSON.parse(fs.readFileSync("data/ingest_atc.json", "utf8"))
};
fs.writeFileSync("data/ingest_merged.json", JSON.stringify(out, null, 2));
console.log("merge OK");
