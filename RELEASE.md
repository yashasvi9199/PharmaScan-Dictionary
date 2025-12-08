# Release Guide

This document explains how to create a versioned release for PharmaScan-Dictionary and publish assets usable via jsDelivr CDN.

Purpose
- A release freezes dictionary data for consistent consumption by external clients.
- Each release is stored under dist/vX.Y.Z/ and must not be modified after publication.

Pre-Release Checklist
- Ensure all dictionary files in data/ are updated and validated.
- Run local validation: npm test
- Build the release directory: ./scripts/build_release.sh vX.Y.Z
- Verify that dist/vX.Y.Z/ exists, manifest.json is correct, and checksums.sha256 is present.

Creating a Release
1. Commit all changes on main.
2. Build the release locally: ./scripts/build_release.sh vX.Y.Z
3. Add and commit the dist folder if you want to include it in the repo:
   git add dist/vX.Y.Z && git commit -m "chore(release): prepare vX.Y.Z"
4. Create an annotated tag locally: git tag -a vX.Y.Z -m "vX.Y.Z"
5. Push the tag to GitHub: git push origin vX.Y.Z
6. Open GitHub → Releases → Draft a new release. Select the pushed tag and publish it.

CDN Usage (jsDelivr)
- After the release is published, clients should use the versioned CDN URL:
  https://cdn.jsdelivr.net/gh/<username>/PharmaScan-Dictionary@vX.Y.Z/dist/vX.Y.Z/<file>
- Example URL (replace <username> and vX.Y.Z): 
  https://cdn.jsdelivr.net/gh/your-user/PharmaScan-Dictionary@v0.1.0/dist/v0.1.0/salts.csv
- Always pin to a release tag. Do not consume files from main in production.

Patch & Major Updates
- Data-only fixes: create a patch release (e.g., v0.1.1).
- Schema changes: create a new major version (e.g., v2.0.0).
- Never overwrite an existing tag; publish a new tag for every release.

Future Automation (optional)
- CI can run the build script on tag push and upload dist/vX.Y.Z as release assets.
- CI can validate checksums and manifest.json automatically before publishing.

Quick Commands Summary
- Build release locally: ./scripts/build_release.sh vX.Y.Z
- Commit dist (optional): git add dist/vX.Y.Z && git commit -m "chore(release): prepare vX.Y.Z"
- Create and push tag: git tag -a vX.Y.Z -m "vX.Y.Z" ; git push origin vX.Y.Z
