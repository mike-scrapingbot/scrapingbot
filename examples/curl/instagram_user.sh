#!/bin/sh
# A public Instagram profile, then its latest posts. 5 credits per call (10 total).
# Usage: sh instagram_user.sh [username]
set -eu
: "${SCRAPINGBOT_API_KEY:?Set SCRAPINGBOT_API_KEY (get one free at https://scrapingbot.io/auth/register)}"
command -v jq >/dev/null || { echo "This example needs jq (https://jqlang.org/)" >&2; exit 1; }
HANDLE="${1:-instagram}"

instagram() {
  curl -sS -X POST "https://scrapingbot.io/api/v1/instagram" \
    -H "x-api-key: $SCRAPINGBOT_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @-
}

PROFILE="$(jq -n --arg u "$HANDLE" '{endpoint: "/user/by_username", params: {username: $u}}' | instagram)"
echo "$PROFILE" | jq 'if .success then .data | {id, username, full_name, follower_count, is_verified} else . end'

# Post lists need the numeric user id from the profile.
USER_ID="$(echo "$PROFILE" | jq -r '.data.id // empty')"
[ -n "$USER_ID" ] || exit 1
jq -n --arg id "$USER_ID" '{endpoint: "/medias/by_user_id", params: {user_id: $id, count: 12}}' | instagram |
  jq 'if .success then .data.edges[].node | {code, taken_at, like_count, comment_count} else . end'
