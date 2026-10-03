#!/bin/sh
# Have AI pull fields out of a page as JSON (ai_result). 1 credit for the page + 5 for AI.
# Usage: sh extract.sh [url] [what to extract]
set -eu
: "${SCRAPINGBOT_API_KEY:?Set SCRAPINGBOT_API_KEY (get one free at https://scrapingbot.io/auth/register)}"
command -v jq >/dev/null || { echo "This example needs jq (https://jqlang.org/)" >&2; exit 1; }
URL="${1:-https://books.toscrape.com/}"
QUERY="${2:-title and price of every book on the page}"

jq -n --arg url "$URL" --arg q "$QUERY" '{url: $url, ai_query: $q}' |
  curl -sS -X POST "https://scrapingbot.io/api/v1/scrape" \
    -H "x-api-key: $SCRAPINGBOT_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @- |
  jq '{success, status, credits_used, ai_result, ai_error, error}'
