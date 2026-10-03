#!/bin/sh
# Search Amazon, then fetch full details for the first result. 10 credits per call (20 total).
# Usage: sh amazon_product.sh ["search query"]
set -eu
: "${SCRAPINGBOT_API_KEY:?Set SCRAPINGBOT_API_KEY (get one free at https://scrapingbot.io/auth/register)}"
command -v jq >/dev/null || { echo "This example needs jq (https://jqlang.org/)" >&2; exit 1; }
QUERY="${1:-wireless earbuds}"

amazon() {
  curl -sS -X POST "https://scrapingbot.io/api/v1/amazon" \
    -H "x-api-key: $SCRAPINGBOT_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @-
}

RESULTS="$(jq -n --arg q "$QUERY" '{endpoint: "/search", params: {query: $q}}' | amazon)"
echo "$RESULTS" | jq 'if .success then .data.products[:5][] | {asin, product_title, product_price, product_star_rating} else . end'

ASIN="$(echo "$RESULTS" | jq -r '.data.products[0].asin // empty')"
[ -n "$ASIN" ] || exit 1
jq -n --arg a "$ASIN" '{endpoint: "/product-details", params: {asin: $a}}' | amazon |
  jq 'if .success then .data | {asin, product_title, product_price, product_availability, product_star_rating, product_num_ratings} else . end'
