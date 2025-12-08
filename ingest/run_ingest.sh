#!/usr/bin/env sh
# ingest/run_ingest.sh
# Robust runner for ingestion pipeline: runs known ingest scripts if present.
# POSIX sh compatible. Exits non-zero on first failure.

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_CMD="${NODE:-node}"

# ensure data dir exists
mkdir -p "$SCRIPT_DIR/../data"

# ordered list of ingest steps (preserves previous working pipeline)
SCRIPTS="
source_openfda.js
source_who_atc.js
merge_ingested.js
"

for s in $SCRIPTS; do
  SCRIPT_PATH="$SCRIPT_DIR/$s"
  if [ -f "$SCRIPT_PATH" ]; then
    echo "==> running: $NODE_CMD $SCRIPT_PATH"
    "$NODE_CMD" "$SCRIPT_PATH"
  else
    echo "==> skipping missing script: $s"
  fi
done

# Run any extra ingest scripts (optional) - executable .sh or .js files in ingest/ prefixed with "extra_"
# This preserves backwards-compat and allows adding extras without editing this file.
for extra in "$SCRIPT_DIR"/extra_*.sh "$SCRIPT_DIR"/extra_*.js; do
  [ -e "$extra" ] || continue
  case "$extra" in
    *.sh)
      echo "==> running extra shell script: $extra"
      sh "$extra"
      ;;
    *.js)
      echo "==> running extra node script: $extra"
      "$NODE_CMD" "$extra"
      ;;
  esac
done

echo "OK"
