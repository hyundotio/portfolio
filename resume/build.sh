#!/bin/sh
# Builds the resume PDF and the two page previews the site shows.
# Needs macOS (Helvetica Neue), Google Chrome, and poppler (pdftoppm).
set -e
D=$(cd "$(dirname "$0")" && pwd)
OUT="$D/../public/assets/downloads/resume"
TMP=$(mktemp -d)
python3 "$D/build.py" > "$D/resume.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-pdf-header-footer --user-data-dir="$TMP/profile" \
  --print-to-pdf="$OUT/resume.pdf" "file://$D/resume.html" 2>/dev/null
pdftoppm -r 144 -png "$OUT/resume.pdf" "$TMP/page"
mv "$TMP/page-1.png" "$OUT/resume_page_1.png"
mv "$TMP/page-2.png" "$OUT/resume_page_2.png"
rm -rf "$TMP" "$D/resume.html"
echo "Wrote $OUT/resume.pdf and page previews"
