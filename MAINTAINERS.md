# Maintainer Rules

All dataset changes must meet:
- Every entry must include `name`.
- Normalization must succeed with no errors.
- Checksums must validate.
- Manifest must rebuild without diff.
- Bundle must regenerate with no missing fields.

Only canonical normalized files are considered source of truth.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.