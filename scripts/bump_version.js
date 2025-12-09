#!/usr/bin/env node
const fs = require("fs");
const { execSync } = require("child_process");

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

function getLatestTag() {
  try {
    // Get all tags matching v*
    const output = execSync("git tag -l 'v*'", { encoding: "utf8" }).trim();
    if (!output) return null;

    const tags = output.split(/\r?\n/).map(t => t.trim()).filter(t => /^v\d+\.\d+\.\d+$/.test(t));

    if (tags.length === 0) return null;

    // Sort descending
    tags.sort((a, b) => {
      const va = parseVersion(a);
      const vb = parseVersion(b);
      // We want b - a for descending
      if (isGreater(va, vb)) return -1;
      if (isGreater(vb, va)) return 1;
      return 0;
    });

    return tags[0];
  } catch (e) {
    return null;
  }
}

function parseVersion(v) {
  if (!v) return null;
  const clean = v.replace(/^v/, "");
  const parts = clean.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return parts;
}

function isGreater(v1, v2) {
  // Returns true if v1 > v2
  for (let i = 0; i < 3; i++) {
    if (v1[i] > v2[i]) return true;
    if (v1[i] < v2[i]) return false;
  }
  return false;
}

let currentVer = parseVersion(pkg.version);
const tagVerStr = getLatestTag();
const tagVer = parseVersion(tagVerStr);

// If git tag is higher than package.json, use that as the base
if (tagVer && isGreater(tagVer, currentVer)) {
  currentVer = tagVer;
}

// Bump patch
currentVer[2] += 1;

const newVersion = currentVer.join(".");
pkg.version = newVersion;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(`v${newVersion}`);
