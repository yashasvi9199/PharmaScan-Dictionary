# Release Process

## Prepare locally
1. Run normalization and verify artifacts:

  `./scripts/run_normalization.sh`
  `./scripts/run_normalization.sh`
  `node scripts/verify_checksums.js`
  `node scripts/status.js` 


## Create release via Actions (recommended)
- Go to GitHub → Actions → Release → Run workflow.
- Choose branch `main` and run.

## Create release via git (alternate)
1. Bump version locally:

  `node scripts/bump_version.js`

  This updates `package.json` and prints the new version tag (e.g., `v0.0.5`).

2. Commit and push with tags:

  `git add package.json`
  `git commit -m "Bump version"`
  `git tag v0.0.5`
  `git push --follow-tags`


## Post-release checks
- Verify GitHub Release contains artifacts (JSON + .sha256 + manifest).
- Verify GitHub Pages contains the `cdn/v<version>/` folder with same artifacts.
- Update RELEASE.md with any manual notes if necessary.

## Rollback
- To revert a bad release: delete the Git tag and release from GitHub, fix data, then create a new release.
