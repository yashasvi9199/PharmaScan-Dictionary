# PharmaScan-Dictionary

PharmaScan-Dictionary is the canonical dataset for PharmaScan: normalized medicine salts, forms, units and OCR-variant artifacts.

## Quick commands
- Run normalization: `./scripts/run_normalization.sh`
- Validate checksums: `node scripts/verify_checksums.js`
- Build bundle: `node scripts/build_bundle.js`
- Run CI locally (simulate): `./scripts/run_normalization.sh`

## Artifacts
`data/out/` contains normalized JSON, `dictionary.bundle.json`, `.sha256` files and `manifest.json`.

## CI / Release
- CI: `.github/workflows/ci.yml` validates dataset on PRs and push.
- Release: `.github/workflows/release.yml` creates GitHub Release + publishes to Pages.

## Contact
Maintainers: see MAINTAINERS.md
