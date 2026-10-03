---
name: google-search
description: Get Google results as JSON through the ScrapingBot API - web results, images, videos, news, shopping, local places, Google Maps listings and place reviews, for any country and language. Use when the user wants search results, SERP data, local businesses or Google Maps reviews. Requires SCRAPINGBOT_API_KEY.
---

# Google results with ScrapingBot

`POST https://scrapingbot.io/api/v1/google`, headers `x-api-key: $SCRAPINGBOT_API_KEY` and `Content-Type: application/json`.
Body: `{"endpoint": "<endpoint>", "params": {...}}`. **10 credits per call**, charged only on success. Timeout 15 s.

## Endpoints

| endpoint | Use for | Required | Results field |
| --- | --- | --- | --- |
| `/search` | Web results | `q` | `organic`, `peopleAlsoAsk`, `relatedSearches` |
| `/images` | Images | `q` | `images` |
| `/videos` | Videos | `q` | `videos` |
| `/news` | News | `q` | `news` |
| `/shopping` | Products, prices, stores | `q` | `shopping` |
| `/places` | Local businesses | `q` | `places` |
| `/maps` | Maps listings, or one place by ID | `q`, or `cid`/`placeId`/`fid` | `places`, `ll` |
| `/reviews` | Reviews of a place | `cid`, `fid` or `placeId` | `reviews`, `nextPageToken` |

## Params

- `q`: query; `site:`, quotes and `-` work as on Google.
- `gl` country (`us`, `gb`, `de`), `hl` language (`en`, `es`). Use these for market targeting; `location` is passed through but city-level targeting is not reliable.
- `num` (Google returns at most 10 per page), `page` (from 1), `start` (offset).
- `tbs`: time filter `qdr:h|d|w|m|y`. `autocorrect`, `safe` (booleans).
- `/places`, `/maps`: `ll` viewport like `@30.27,-97.74,12z`.
- `/reviews`: `sortBy` = `mostRelevant` (default), `newest`, `highestRating`, `lowestRating`; `nextPageToken` for the next page (~20 reviews per page).

Workflow for reviews: `/places` or `/maps` with `q` → take `cid` (or `placeId`) from a result → `/reviews`.

## Example

```bash
curl -X POST "https://scrapingbot.io/api/v1/google" \
  -H "x-api-key: $SCRAPINGBOT_API_KEY" -H "Content-Type: application/json" \
  -d '{"endpoint": "/search", "params": {"q": "best espresso machine", "gl": "us"}}'
```

## Fields worth reading

- `organic[]`: `position`, `title`, `link`, `snippet`, sometimes `date`.
- `images[]`: `title`, `imageUrl`, `imageWidth`, `imageHeight`, `thumbnailUrl`, `source`, `link`.
- `videos[]`: `title`, `link`, `channel`, `duration`, `date`, `source`.
- `news[]`: `title`, `link`, `source`, `date`.
- `shopping[]`: `title`, `price`, `source` (store), `rating`, `ratingCount`, `link`.
- `places[]`: `title`, `address`, `category`, `rating`, `ratingCount`, `website`, `latitude`, `longitude`, `cid`; `/maps` adds `phoneNumber`, `openingHours`, `placeId`, `fid`.
- `reviews[]`: `rating`, `snippet`, `date`, `isoDate`, `likes`.
- Every response: `searchParameters` (your query echoed), `creditsUsed`.

## Errors

Errors are `{"success": false, "error": "..."}` and are never charged.
- `400`: missing `q` (or place ID for `/reviews`). Fix and resend.
- `401` bad key; `402` not enough credits (tell the user); `429` concurrency limit (free plan allows 1 request at a time; wait and retry).
- `408` / `5xx`: temporary; retry with backoff.

Docs: https://scrapingbot.io/docs/google
