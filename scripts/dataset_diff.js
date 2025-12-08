#!/usr/bin/env node
const fs = require("fs");

const oldFile = process.argv[2];
const newFile = process.argv[3];

if (!oldFile || !newFile) process.exit(1);

const oldData = JSON.parse(fs.readFileSync(oldFile, "utf8"));
const newData = JSON.parse(fs.readFileSync(newFile, "utf8"));

const oldNames = new Set(oldData.map(r => r.name));
const newNames = new Set(newData.map(r => r.name));

const added = [...newNames].filter(x => !oldNames.has(x));
const removed = [...oldNames].filter(x => !newNames.has(x));

console.log("ADDED:", added);
console.log("REMOVED:", removed);
