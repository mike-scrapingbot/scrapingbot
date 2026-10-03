#!/bin/sh
# A public TikTok profile, then its latest videos. 1 credit per call (2 total).
# Usage: sh tiktok_user.sh [username]
set -eu
: "${SCRAPINGBOT_API_KEY:?Set SCRAPINGBOT_API_KEY (get one free at https://scrapingbot.io/auth/register)}"
command -v jq >/dev/null || { echo "This example needs jq (https://jqlang.org/)" >&2; exit 1; }
HANDLE="${1:-tiktok}"

tiktok() {
  curl -sS -X POST "https://scrapingbot.io/api/v1/tiktok" \
    -H "x-api-key: $SCRAPINGBOT_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @-
}

jq -n --arg u "$HANDLE" '{endpoint: "/user/info", params: {unique_id: $u}}' | tiktok |
  jq 'if .success then {user: .data.user.uniqueId, name: .data.user.nickname, followers: .data.stats.followerCount, videos: .data.stats.videoCount} else . end'

jq -n --arg u "$HANDLE" '{endpoint: "/user/posts", params: {unique_id: $u, count: 10}}' | tiktok |
  jq 'if .success then .data.videos[] | {video_id, title, play_count, digg_count, comment_count} else . end'
