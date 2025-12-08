# Versioning

We follow semantic versioning for dataset releases.

- Format: `MAJOR.MINOR.PATCH` (e.g., `v1.2.3`)
- Bump rules:
  - PATCH: content fixes, metadata corrections
  - MINOR: incremental dataset additions that do not break consumers
  - MAJOR: breaking schema or ID changes (e.g., slug changes)

Release automation:
- `scripts/bump_version.js` increments PATCH.
- `release.yml` tags and publishes artifacts.
