#!/usr/bin/env bash
# Cleans the hand-drawn wordmark exports and derives logo.svg (for the OG card).
#
# The Inkscape exports carry ~2 KB of editor cruft (sodipodi:namedview,
# inkscape:* attributes, empty <defs>, dead font-family in path styles).
# svgo strips all of that without touching the geometry. Then logo.svg —
# which hadley's OG generator looks for by that exact name — is made a copy
# of the dark wordmark, because the OG card ground is dark.
#
# Run from the repo root after re-exporting logo-light.svg / logo-dark.svg:
#   bash scripts/prep-logos.sh
set -euo pipefail
cd "$(dirname "$0")/.."

img=theme/assets/images
cfg=scripts/svgo.logo.mjs

for f in logo-light logo-dark; do
  if grep -qE '<text|<tspan' "$img/$f.svg"; then
    echo "ERROR: $img/$f.svg still contains live <text> — it needs a real font" >&2
    echo "       to render and won't work on the web. In Inkscape: select the" >&2
    echo "       wordmark, Path > Object to Path (Shift+Ctrl+C), then re-export." >&2
    exit 1
  fi
  bunx --yes svgo --quiet --config "$cfg" -i "$img/$f.svg" -o "$img/$f.svg"
  # svgo leaves a couple of inert leftovers Inkscape emits
  perl -0pi -e 's/ xml:space="preserve"//g; s/ style="[^"]*-inkscape-font-specification[^"]*"//g' "$img/$f.svg"
  echo "cleaned $img/$f.svg ($(wc -c < "$img/$f.svg") bytes)"
done

cp "$img/logo-dark.svg" "$img/logo.svg"
echo "logo.svg <- logo-dark.svg (OG card)"
