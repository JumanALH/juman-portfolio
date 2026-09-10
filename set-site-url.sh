#!/usr/bin/env bash
# Swap the site URL everywhere at once, after you know your real address.
# Usage:  bash set-site-url.sh https://juman-portfolio.onrender.com
set -e
NEW="${1%/}"
if [ -z "$NEW" ]; then echo "Usage: bash set-site-url.sh https://your-site-url"; exit 1; fi
OLD=$(grep -o 'https://[a-z0-9.-]*\.\(onrender\.com\|vercel\.app\|pages\.dev\|netlify\.app\)' index.html | head -1)
if [ -z "$OLD" ]; then echo "Could not find the current URL in index.html"; exit 1; fi
for f in index.html 404.html robots.txt sitemap.xml assets/js/config.js README.md; do
  [ -f "$f" ] || continue
  sed -i.bak "s#$OLD#$NEW#g" "$f" && rm -f "$f.bak"
done
echo "Updated $OLD  ->  $NEW"
