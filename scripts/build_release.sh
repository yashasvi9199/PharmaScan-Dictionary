#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: $0 <version>   e.g. $0 v0.1.0"
  exit 1
fi

VER="$1"
OUTDIR="dist/$VER"

echo "Building release for $VER → $OUTDIR"

mkdir -p "$OUTDIR"
cp -v data/* "$OUTDIR/"

# create checksums file
pushd "$OUTDIR" >/dev/null
rm -f checksums.sha256 manifest.json
echo "Generating checksums..."
for f in *; do
  if [ -f "$f" ]; then
    sha256sum "$f" >> checksums.sha256
  fi
done

# Build manifest.json
CREATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "{" > manifest.json.tmp
echo "  \"version\": \"${VER}\"," >> manifest.json.tmp
echo "  \"created_at\": \"${CREATED_AT}\"," >> manifest.json.tmp
echo "  \"generated_by\": \"PharmaScan-Dictionary build_release.sh\"," >> manifest.json.tmp
echo "  \"files\": [" >> manifest.json.tmp

first=true
while read -r line; do
  checksum="$(echo "$line" | awk '{print $1}')"
  filename="$(echo "$line" | awk '{print $2}')"
  # Remove leading ./ if present
  filename="${filename#./}"
  if [ "$first" = true ]; then
    first=false
  else
    echo "    ," >> manifest.json.tmp
  fi
  # append file entry
  printf '    { "path": "%s", "sha256": "%s" }' "$filename" "$checksum" >> manifest.json.tmp
done < checksums.sha256

echo "" >> manifest.json.tmp
echo "  ]," >> manifest.json.tmp
echo "  \"notes\": \"Auto-generated release manifest. Verify checksums before publishing.\"" >> manifest.json.tmp
echo "}" >> manifest.json.tmp

mv manifest.json.tmp manifest.json
echo "Release build prepared in $OUTDIR"
popd >/dev/null
