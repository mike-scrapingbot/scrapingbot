---
name: instagram-data
description: Get public Instagram data as JSON through the ScrapingBot API - profiles, an account's posts, reels and tagged posts, active stories, single posts, comments and replies, follower/following lists, and search for accounts, hashtags, places and posts. Use when the user asks about Instagram accounts, posts, reels or comments. Requires SCRAPINGBOT_API_KEY.
---

# Instagram public data with ScrapingBot

`POST https://scrapingbot.io/api/v1/instagram`, headers `x-api-key: $SCRAPINGBOT_API_KEY` and `Content-Type: application/json`.
Body: `{"endpoint": "<endpoint>", "params": {...}}`. **5 credits per call** (each page is a call), charged only on success. Timeout 45 s.

## Endpoints

| endpoint | Use for | Params |
| --- | --- | --- |
| `/user/by_username` | Profile | `username` (with or without `@`, or a profile URL) |
| `/user/by_id` | Profile by numeric id | `user_id` |
| `/medias/by_user_id` | An account's posts | `user_id`, `count` 1–50, `end_cursor` |
| `/reels/by_user_id` | An account's reels | `user_id`, `page_size` 1–50, `max_id` |
| `/medias/tagged_by_user_id` | Posts the account is tagged in | `user_id`, `count` max 12, `end_cursor` |
| `/stories/by_username` | Active stories (live now only) | `username` |
| `/followers/by_user_id`, `/following/by_user_id` | Followers / following | `user_id` (numeric), `query` (search the list), `max_id` |
| `/media/by_shortcode`, `/media/by_url` | One post or reel | `shortcode` / `url` |
| `/comments/media_comments_by_id` | Comments on a post | `code_or_id_or_url`, `pagination_token` |
| `/comments/replies` | Replies to a comment | `code_or_id_or_url`, `comment_id` |
| `/search/users_by_keyword`, `/search/hashtags_by_keyword`, `/search/places_by_keyword`, `/search/global` | Accounts / hashtags / places / all three | `keyword` |
| `/search/posts` | Posts and reels for a keyword (one page) | `query` |
| `/media/shortcode_to_id`, `/media/id_to_shortcode` | Convert ids (still 5 credits) | `shortcode` / `id` |

Most list endpoints need the numeric `user_id`: call `/user/by_username` first and use `data.id`.

## Example

```bash
curl -X POST "https://scrapingbot.io/api/v1/instagram" \
  -H "x-api-key: $SCRAPINGBOT_API_KEY" -H "Content-Type: application/json" \
  -d '{"endpoint": "/user/by_username", "params": {"username": "instagram"}}'
```

## Fields worth reading

Envelope: `success`, `data`, `duration`, `creditsUsed`.

- Profile: `data.id`, `username`, `full_name`, `biography`, `follower_count`, `following_count`, `is_verified`, `is_private`, `external_url`, `profile_pic_url`.
- Posts: `data.edges[].node` (`code`, `taken_at`, `like_count`, `comment_count`, `caption.text`, `display_url`, `is_video`); next page via `data.page_info.end_cursor` while `has_next_page`.
- Reels: `data.items[].media` (`code`, `taken_at`, `like_count`, `comment_count`, `caption.text`); next page via `data.paging_info.max_id` while `more_available`. Do not rely on reel play/view counts: they are often empty.
- One post: `data.code`, `like_count`, `comment_count`, `caption.text`, `owner.username`, `video_versions` / `image_versions`.
- Comments: `data.data.items[]` (`id`, `text`, `created_at`, `comment_like_count`, `child_comment_count`), `data.data.total`; next page via `data.pagination_token`. Replies: `data.data.items[]`, parent in `data.data.additional_data`.
- Followers/following: `data.users[]`; next page by sending `next_max_id` back as `max_id` while `has_more`. For very large accounts only ~50 recent followers are listed; use `query` to look for a specific account.
- Stories: `data.data.items[]` (`media_type` 1 photo / 2 video, `taken_at`, `expiring_at`, `image_versions`, `video_versions`). No active story = empty list, still charged. Media URLs expire; download soon.
- Search: `data.users[]` / `hashtags[]` / `places[]`; `/search/posts` → `data.data.items[]`.

## Errors

Errors look like `{"success": false, "error": "Missing required parameter: username"}` and are never charged.
- `400`: missing/invalid param (e.g. tagged `count` over 12, non-numeric `user_id`). Fix and resend.
- `404`: account or post wasn't found.
- `500` `Failed to process Instagram request`: unsupported endpoint name; check the table.
- `401` bad key; `402` not enough credits (tell the user); `429` concurrency limit (free plan: 1 at a time; wait and retry).
- `408` / other `5xx`: temporary; retry with backoff.

Docs: https://scrapingbot.io/docs/instagram
