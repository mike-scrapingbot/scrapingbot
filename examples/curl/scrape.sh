#!/bin/sh
# Fetch a page's HTML. 1 credit (5 with render_js=true).
# Usage: sh scrape.sh [url]
set -eu
: "${SCRAPINGBOT_API_KEY:?Set SCRAPINGBOT_API_KEY (get one free at https://scrapingbot.io/auth/register)}"
URL="${1:-https://example.com}"

curl -sS --get "https://scrapingbot.io/api/v1/scrape" \
  -H "x-api-key: $SCRAPINGBOT_API_KEY" \
  --data-urlencode "url=$URL"
# Add  --data-urlencode "render_js=true"  for pages built with JavaScript.
echo
