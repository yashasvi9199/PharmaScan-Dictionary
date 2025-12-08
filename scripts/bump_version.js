#!/usr/bin/env node
const fs = require("fs");

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

if (!pkg.version) {
  console.error("package.json missing version");
  process.exit(1);
}

const parts = pkg.version.split(".").map(Number);
if (parts.length !== 3) {
  console.error("Invalid version format");
  process.exit(2);
}

parts[2] += 1; // patch bump
const newVersion = parts.join(".");
pkg.version = newVersion;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(`v${newVersion}`);
