#!/bin/sh
# Google web results as JSON. 10 credits.
# Usage: sh google_search.sh "your query" [country]
set -eu
: "${SCRAPINGBOT_API_KEY:?Set SCRAPINGBOT_API_KEY (get one free at https://scrapingbot.io/auth/register)}"
command -v jq >/dev/null || { echo "This example needs jq (https://jqlang.org/)" >&2; exit 1; }
Q="${1:-best espresso machine}"
GL="${2:-us}"

jq -n --arg q "$Q" --arg gl "$GL" '{endpoint: "/search", params: {q: $q, gl: $gl}}' |
  curl -sS -X POST "https://scrapingbot.io/api/v1/google" \
    -H "x-api-key: $SCRAPINGBOT_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @- |
  jq 'if .success then .organic[] | {position, title, link} else . end'
