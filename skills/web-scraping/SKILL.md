---
name: web-scraping
description: Fetch any public web page through the ScrapingBot API as HTML (optionally rendered in a real browser, with clicks/typing, screenshots), or have AI extract specific fields as JSON. Use when the user wants the content of a URL, data pulled from a page, or a page that needs JavaScript. Requires SCRAPINGBOT_API_KEY.
---

# Web scraping and AI extraction with ScrapingBot

`GET` or `POST https://scrapingbot.io/api/v1/scrape`, header `x-api-key: $SCRAPINGBOT_API_KEY`.
Parameters go in the query string or a JSON body (body wins). URL-encode `url` in a query string.

For Google results pages use the `google-search` skill instead: `google.com/search?q=…` URLs are rejected here with `400`.
For TikTok, Instagram and Amazon prefer their skills: cleaner JSON, and cheaper than rendering those sites.

## Choose the cheapest mode that works

| Mode | Parameters | Credits |
| --- | --- | --- |
| Plain HTTP | none | 1 |
| Rendered in a browser | `render_js=true` (also turned on by `screenshot`, `js_scenario`) | 5 |
| Premium proxy (residential IPs) | `premium_proxy=true` | 10 |
| Stealth proxy (always renders) | `stealth_proxy=true` | 75 |
| AI extraction | `ai_query` or `ai_schema` | +5 on top of the mode |

Costs don't stack: the most capable mode sets the price, AI adds 5. Start with plain HTTP; add `render_js` only if the HTML lacks content a browser shows. Escalate to a proxy option only if cheaper modes keep failing; failed attempts are refunded. Never use `stealth_proxy` without the user agreeing to 75 credits per call.

## Parameters

- `url` (required): full `http(s)://` URL, max 4096 chars. Private/local addresses are rejected.
- `render_js`, `block_ads`, `block_resources` (booleans, `true`/`1`).
- `wait_for`: CSS selector to wait for (rendering only). Prefer it over `wait`.
- `wait`: extra ms after load, 0–45000. `wait_browser`: `domcontentloaded` (default), `load`, `networkidle0`, `networkidle2`.
- `screenshot`: `true` (viewport) or `full_page`. Returned base64 PNG in `screenshot`.
- `js_scenario`: JSON array (or `{"instructions": [...]}`), max 49 steps, e.g. `[{"click": "#accept"}, {"fill": ["#q", "shoes"]}, {"wait_for": ".results"}, {"scroll_y": 1200}, {"wait": 1000}, {"evaluate": "document.title"}]`. Also `wait_for_and_click`, `scroll_x`, `infinite_scroll` (`{"max_count": 5, "delay": 1000}`). Send it in a JSON body. Invalid JSON is charged as `fault: "user"`, so validate first.
- `cookies`: string `a=1; b=2`, object, or array of `{name, value}`. Not allowed with `stealth_proxy`.
- `timeout`: ms, max and default 45000.
- `ai_query`: plain English, e.g. `"product name, price and rating"`.
- `ai_schema`: object (or JSON string) with `properties`, e.g. `{"type":"object","properties":{"price":{"type":"number"},"in_stock":{"type":"boolean"}}}`. Takes precedence over `ai_query`. The AI reads the page text (up to 50,000 characters).

## Example

```bash
curl -X POST "https://scrapingbot.io/api/v1/scrape" \
  -H "x-api-key: $SCRAPINGBOT_API_KEY" -H "Content-Type: application/json" \
  -d '{"url": "https://books.toscrape.com/", "ai_query": "title and price of every book"}'
```

## Response

Success: `success: true`, `url`, `html`, `status` (the page's status), `duration`, `credits_used`, `job_id`; plus `screenshot`, `scenario` (action report), `ai_result` (extracted JSON) and `ai_error` when relevant. If `ai_error` is set the scrape still succeeded and was charged; read `html` yourself.

`GET /api/v1/job/{job_id}` re-fetches a result for 24 hours (free): `status` (`completed`/`failed`), `result.html`, `result.status`.

## Errors

The HTTP status mirrors the target page, so read the JSON body even on non-2xx. Failures carry `fault`:

- `user` (page answered 400/404): charged. Don't retry the same URL.
- `system` (site 403/429/5xx, or our side) and `timeout` (over 45 s, HTTP 408): refunded, `credits_used: 0`. Retry with backoff, or step up the mode.
- `400` without `fault`: invalid parameter (message says which). Free; fix and resend.
- `401` bad key, `402` not enough credits (tell the user), `429` concurrency limit (free plan: 1 request at a time; wait and retry, don't parallelize).

Docs: https://scrapingbot.io/docs/website
