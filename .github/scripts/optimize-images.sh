#!/usr/bin/env bash
set -euo pipefail

SIZES=(1600 1200 800)
JPEG_QUALITY=80
WEBP_QUALITY=75

# Explicit list des fichiers to process
FILES=("logo.jpg" "piscine.png" "salon.png" "cuisine.jpg" "agrandissement.jpg")

mkdir -p originals-backup images

for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "Skipping $f — not found"
    continue
  fi

  name="${f%.*}"
  echo "Processing $f -> $name"

  # Backup original if not already present
  if [ ! -f "originals-backup/$f" ]; then
    mv "$f" "originals-backup/$f"
  else
    echo "originals-backup/$f already exists — skipped mv"
  fi

  for s in "${SIZES[@]}"; do
    out_jpg="images/${name}-${s}.jpg"
    out_webp="images/${name}-${s}.webp"

    convert "originals-backup/$f" -resize "${s}x" -strip -quality "$JPEG_QUALITY" "$out_jpg"

    if command -v cwebp >/dev/null 2>&1; then
      cwebp -q "$WEBP_QUALITY" "$out_jpg" -o "$out_webp" >/dev/null 2>&1 || echo "cwebp failed for $out_jpg"
    else
      echo "cwebp not installed — skipping webp for $out_jpg"
    fi
  done

done

# Commit & push new branch if files were created
BRANCH="fix/images-opt"
# Configure git
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

git checkout -b "$BRANCH"

git add images originals-backup || true

# Only commit if there are changes
if git diff --staged --quiet; then
  echo "No image changes to commit."
else
  git commit -m "chore(images): backup originals + add optimized JPEG+WebP (1600/1200/800)"
  git push --set-upstream origin "$BRANCH"
  echo "Pushed branch $BRANCH"
fi
