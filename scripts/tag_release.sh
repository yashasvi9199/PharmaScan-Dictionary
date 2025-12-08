#!/usr/bin/env sh
set -e
VERSION=$(node scripts/bump_version.js)
git config user.name "github-actions"
git config user.email "github-actions@github.com"
git commit -am "release: $VERSION" || true
git tag $VERSION
echo $VERSION
