---
name: tiktok-data
description: Get public TikTok data as JSON through the ScrapingBot API - video stats and media URLs, profiles, an account's videos, followers/following lists, user and video search, sounds and the videos using them, comments and replies. Use when the user asks about TikTok videos, creators, sounds, hashtags or comments. Requires SCRAPINGBOT_API_KEY.
---

# TikTok public data with ScrapingBot

`POST https://scrapingbot.io/api/v1/tiktok`, headers `x-api-key: $SCRAPINGBOT_API_KEY` and `Content-Type: application/json`.
Body: `{"endpoint": "<endpoint>", "params": {...}}`. **1 credit per call** (each page is a call), charged only on success. Timeout 30 s.

## Endpoints

| endpoint | Use for | Params |
| --- | --- | --- |
| `/` | One video's stats, caption, author, sound, media URLs | `url` (must contain `/video/`), optional `hd: "1"` |
| `/user/info` | Profile and counters | `unique_id` (username, `@handle` or profile URL) or `user_id` (numeric) |
| `/user/posts` | An account's videos, newest first | `unique_id`, `count` (max 10), `cursor` |
| `/user/followers`, `/user/following` | Follower / following accounts | `user_id` (numeric, required), `count` 1–50 |
| `/user/search` | Accounts matching a keyword | `keywords`, `count` 1–50 |
| `/feed/search` | Videos matching a keyword | `keywords`, `count` 1–50, `offset` (or `cursor`), `search_id`, `region` (e.g. `US`) |
| `/music/info` | A sound's details | `music_id` (or sound page `url`) |
| `/music/posts` | Videos using a sound | `music_id` (or `url`), `count` 1–35, `cursor` |
| `/comment/list` | Comments on a video | `url` (video URL), `count` 1–50, `cursor` |
| `/comment/reply` | Replies to one comment | `comment_id`, `video_id` (or video `url`), `count` 1–50, `cursor` |

`user_id` must be the numeric id from `/user/info` (`data.user.id`); a username returns `400`. So: `/user/info` first, then followers/following.

## Example

```bash
curl -X POST "https://scrapingbot.io/api/v1/tiktok" \
  -H "x-api-key: $SCRAPINGBOT_API_KEY" -H "Content-Type: application/json" \
  -d '{"endpoint": "/user/info", "params": {"unique_id": "tiktok"}}'
```

## Fields worth reading

Envelope: `success`, `data`, `duration`, `creditsUsed`.

- `/`: `data.id`, `title`, `create_time` (unix), `duration`, `play_count`, `digg_count` (likes), `comment_count`, `share_count`, `collect_count`, `play` (video URL), `cover`, `author.unique_id`, `music_info`.
- `/user/info`: `data.user` (`id`, `uniqueId`, `nickname`, `signature`, `verified`), `data.stats` (`followerCount`, `followingCount`, `heartCount`, `videoCount`).
- `/user/posts`, `/music/posts`, `/feed/search`: `data.videos[]` with `video_id`, `title`, `play_count`, `digg_count`, `comment_count`, `create_time`, `author`.
- `/user/search`: `data.user_list[]` with `user` and `stats`.
- `/user/followers` → `data.followers[]`; `/user/following` → `data.followings[]`; `data.total` is the account's full count, not the number returned.
- `/comment/list`, `/comment/reply`: `data.comments[]` with `id`, `text`, `digg_count`, `reply_total`, `create_time`, `user`; `data.total`.
- `/music/info`: `data.title`, `author`, `duration`, `video_count`, `play`.

## Pagination

List endpoints return `data.cursor` and `data.hasMore`. Send `cursor` back unchanged (for `/feed/search` send it as `offset` along with `search_id` from `data.searchId`). Continue while `hasMore` is `1` or `true`; page sizes vary, so don't stop on a short page. De-duplicate on `video_id`. `/user/search`, `/user/followers` and `/user/following` are single-page: raise `count` instead.

## Errors

Errors look like `{"success": false, "error": "unique_id is required.", "code": 400}` and are never charged.
- `400`: missing/invalid param or unsupported endpoint; fix and resend.
- `404`: the video or account wasn't found.
- `401` bad key; `402` not enough credits (tell the user); `429` concurrency limit (free plan: 1 at a time; wait and retry).
- `408` / `5xx`: temporary; retry with backoff.

Docs: https://scrapingbot.io/docs/tiktok
