# ScrapingBot

**One API key for public web data:** scrape any page (plain or JavaScript-rendered), pull fields out with AI, and get public TikTok, Instagram, Google and Amazon data as JSON. A hosted MCP server gives AI agents the same data as tools.

**100 free credits when you sign up. No credit card.** [Get your API key](https://scrapingbot.io/auth/register?utm_source=github&utm_medium=readme&utm_campaign=repo)

[Docs](https://scrapingbot.io/docs?utm_source=github&utm_medium=readme&utm_campaign=repo) ·
[Pricing](https://scrapingbot.io/pricing?utm_source=github&utm_medium=readme&utm_campaign=repo) ·
[MCP server](https://scrapingbot.io/mcp?utm_source=github&utm_medium=readme&utm_campaign=repo) ·
[Examples](examples/) ·
[Agent Skills](skills/)

---

## Quickstart

```bash
export SCRAPINGBOT_API_KEY="YOUR_API_KEY"

curl "https://scrapingbot.io/api/v1/scrape?url=https://example.com" \
  -H "x-api-key: $SCRAPINGBOT_API_KEY"
```

```json
{
  "success": true,
  "url": "https://example.com",
  "html": "<!doctype html><html lang=en><head>…",
  "status": 200,
  "duration": "0.79",
  "credits_used": 1,
  "job_id": "…"
}
```

That call cost 1 credit. Failed requests are refunded automatically.

**Base URL:** `https://scrapingbot.io/api/v1`
**Auth:** `x-api-key: YOUR_API_KEY` header (or `Authorization: Bearer YOUR_API_KEY`). Keep the key on the server.

## Endpoints

The data APIs (TikTok, Instagram, Google, Amazon) are all `POST` with a JSON body naming the `endpoint` and its `params`:

```bash
curl -X POST "https://scrapingbot.io/api/v1/tiktok" \
  -H "x-api-key: $SCRAPINGBOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "/user/info", "params": {"unique_id": "tiktok"}}'
```

| API | Route | `endpoint` values | Credits |
| --- | --- | --- | --- |
| Website | `GET` or `POST /api/v1/scrape` | one route; options: `render_js`, `screenshot`, `js_scenario`, `wait_for`, `premium_proxy`, `stealth_proxy`, … | 1 plain · 5 rendered · 10 premium proxy · 75 stealth proxy |
| AI extraction | `/api/v1/scrape` + `ai_query` or `ai_schema` | returns `ai_result` JSON | +5 on top of the page |
| Job lookup | `GET /api/v1/job/:job_id` | re-fetch a scrape result (kept 24 hours) | free |
| TikTok | `POST /api/v1/tiktok` | `/` (video), `/user/info`, `/user/posts`, `/user/followers`, `/user/following`, `/user/search`, `/feed/search`, `/music/info`, `/music/posts`, `/comment/list`, `/comment/reply` | 1 |
| Instagram | `POST /api/v1/instagram` | `/user/by_username`, `/user/by_id`, `/medias/by_user_id`, `/reels/by_user_id`, `/medias/tagged_by_user_id`, `/stories/by_username`, `/followers/by_user_id`, `/following/by_user_id`, `/media/by_shortcode`, `/media/by_url`, `/comments/media_comments_by_id`, `/comments/replies`, `/search/users_by_keyword`, `/search/hashtags_by_keyword`, `/search/places_by_keyword`, `/search/global`, `/search/posts`, `/media/shortcode_to_id`, `/media/id_to_shortcode` | 5 |
| Google | `POST /api/v1/google` | `/search`, `/images`, `/videos`, `/news`, `/shopping`, `/places`, `/maps`, `/reviews` | 10 |
| Amazon | `POST /api/v1/amazon` | `/search`, `/product-details`, `/products` (up to 20 ASINs), `/autocomplete`, `/best-sellers`, `/new-releases`, `/product-category-list`, `/deals-v2`, `/seller-profile`, `/seller-products` | 10 (`/products`: 10 per product returned) |
| ChatGPT | `POST /api/v1/chatgpt` | body `{"prompt": "…"}` | 10 |
| MCP | `POST /api/mcp` | 23 tools over Streamable HTTP | same as the API behind each tool |

Full parameters and response shapes: [docs](https://scrapingbot.io/docs?utm_source=github&utm_medium=readme&utm_campaign=repo).

### How charging works

- **Data APIs** charge only for a successful `200`. Any error is refunded.
- **Website API** charges when the page answers (2xx/3xx, or a real 400/404 from the site, reported as `fault: "user"`). Timeouts, other 4xx such as 403 and 429, 5xx and errors on our side are refunded (`credits_used: 0`).
- Requests rejected before they run (missing parameter, bad key, concurrency limit) cost nothing.

### Limits

Limits are on **requests in flight at once**, not per minute. The free plan allows 1 concurrent request; paid plans allow 10 to 200. Going over returns `429` right away (free); retry with a short, growing delay. Timeouts: 45 s for scraping and Instagram, 30 s for TikTok and Amazon, 15 s for Google.

| Status | Meaning | Charged |
| --- | --- | --- |
| 400 | Missing or invalid parameter, unsupported endpoint | No (except a target page's own 400 on the Website API) |
| 401 | Missing or invalid API key | No |
| 402 | Not enough credits; the message says how many are needed | No |
| 404 | Website API: the page doesn't exist. Data APIs: profile, post or product not found | Website API only |
| 408 | Timed out | No |
| 429 | Concurrency limit reached | No |
| 5xx | The site or a data source failed | No |

## MCP server for AI agents

Hosted at **`https://scrapingbot.io/api/mcp`** (Streamable HTTP, stateless). Nothing to install. Authenticate with your API key in the `x-api-key` header, or `Authorization: Bearer`.

### Claude Code

```bash
claude mcp add --transport http scrapingbot https://scrapingbot.io/api/mcp \
  --header "x-api-key: YOUR_API_KEY"
```

Add `--scope user` to use it in every project. Type `/mcp` in a session to see the tools.

### Claude Desktop (and Claude on the web)

Open **Settings → Connectors → Add custom connector**, name it ScrapingBot, and paste:

```
https://scrapingbot.io/api/mcp?api_key=YOUR_API_KEY
```

Then turn it on from the tools menu in a chat. Connectors take a URL only, so the key goes in the URL: keep that URL private, like a password.

### Cursor

`~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project):

```json
{
  "mcpServers": {
    "scrapingbot": {
      "url": "https://scrapingbot.io/api/mcp",
      "headers": { "x-api-key": "YOUR_API_KEY" }
    }
  }
}
```

### VS Code

`.vscode/mcp.json` in your project, then pick the ScrapingBot tools in Copilot's agent mode:

```json
{
  "servers": {
    "scrapingbot": {
      "type": "http",
      "url": "https://scrapingbot.io/api/mcp",
      "headers": { "x-api-key": "YOUR_API_KEY" }
    }
  }
}
```

### Any other MCP client

URL `https://scrapingbot.io/api/mcp`, header `x-api-key: YOUR_API_KEY` (or `Authorization: Bearer YOUR_API_KEY`). If the client only takes a URL, append `?api_key=YOUR_API_KEY`. When calling it by hand, send `Accept: application/json, text/event-stream`.

### Tools

| Area | Tools | Credits |
| --- | --- | --- |
| Any website | `scrapeWebsite` (markdown or HTML, optional screenshot), `extractStructuredData` (AI fields as JSON), `runBrowserScenario` (click, fill, scroll, wait) | 1 / 5 rendered; +5 for AI |
| Google | `googleSearch` (web, images, videos, news, shopping, places, maps), `googleReviews` | 10 |
| Instagram | `instagramUser`, `instagramSearch`, `instagramMedia`, `instagramFollowers` | 5 |
| TikTok | `tiktokVideo`, `tiktokUser`, `tiktokSearch`, `tiktokComments`, `tiktokFollowers` | 1 |
| Amazon | `amazonSearch`, `amazonProduct`, `amazonProducts`, `amazonSuggestions`, `amazonRankings` | 10 |
| Utility | `listCapabilities`, `getScrapeJob`, `pollJobUntilDone` (free), `providerRequest` (any endpoint above) | |

Tool calls are ordinary API requests: same credits, same concurrency slots, same refunds.

## Agent Skills

[`skills/`](skills/) holds [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) that teach an agent to call the REST API directly with `SCRAPINGBOT_API_KEY`: which endpoint for which task, the parameters, the response fields worth reading, error handling and costs.

| Skill | Use it for |
| --- | --- |
| [`web-scraping`](skills/web-scraping/SKILL.md) | Fetching any page, rendering JavaScript, browser actions, screenshots, AI extraction |
| [`google-search`](skills/google-search/SKILL.md) | Google web, images, videos, news, shopping, places, maps and reviews |
| [`tiktok-data`](skills/tiktok-data/SKILL.md) | Public TikTok videos, profiles, posts, sounds, comments and search |
| [`instagram-data`](skills/instagram-data/SKILL.md) | Public Instagram profiles, posts, reels, comments and search |
| [`amazon-products`](skills/amazon-products/SKILL.md) | Amazon search, product details, batches, rankings, suggestions and deals |

Claude Code: copy a folder into `~/.claude/skills/` (or `.claude/skills/` in a project). Set `SCRAPINGBOT_API_KEY` in the environment the agent runs in.

## Examples

Small, runnable scripts in [`examples/`](examples/), each in curl, Python (`requests`) and Node (built-in `fetch`, Node 18+):

| Task | curl | Python | Node |
| --- | --- | --- | --- |
| Scrape a page | [scrape.sh](examples/curl/scrape.sh) | [scrape.py](examples/python/scrape.py) | [scrape.mjs](examples/node/scrape.mjs) |
| Extract fields with AI | [extract.sh](examples/curl/extract.sh) | [extract.py](examples/python/extract.py) | [extract.mjs](examples/node/extract.mjs) |
| Google search | [google_search.sh](examples/curl/google_search.sh) | [google_search.py](examples/python/google_search.py) | [google_search.mjs](examples/node/google_search.mjs) |
| TikTok profile and latest videos | [tiktok_user.sh](examples/curl/tiktok_user.sh) | [tiktok_user.py](examples/python/tiktok_user.py) | [tiktok_user.mjs](examples/node/tiktok_user.mjs) |
| Instagram profile and posts | [instagram_user.sh](examples/curl/instagram_user.sh) | [instagram_user.py](examples/python/instagram_user.py) | [instagram_user.mjs](examples/node/instagram_user.mjs) |
| Amazon search and product details | [amazon_product.sh](examples/curl/amazon_product.sh) | [amazon_product.py](examples/python/amazon_product.py) | [amazon_product.mjs](examples/node/amazon_product.mjs) |

Python needs `pip install requests`; the curl scripts that build JSON use `jq`. Each language folder has a tiny shared client (`scrapingbot.py`, `scrapingbot.mjs`) that retries refunded failures (408, 429, 5xx) with backoff.

```bash
export SCRAPINGBOT_API_KEY="YOUR_API_KEY"
sh examples/curl/scrape.sh https://example.com
python examples/python/google_search.py "best espresso machine"
node examples/node/tiktok_user.mjs tiktok
```

## Pricing

Free: 100 credits on sign-up, 1 concurrent request. Paid plans start at $49.99/month for 275,000 credits and 10 concurrent requests. See [pricing](https://scrapingbot.io/pricing?utm_source=github&utm_medium=readme&utm_campaign=repo).

## Responsible use

ScrapingBot returns publicly available data. Respect each site's terms and applicable law, and handle any personal data you collect accordingly.

## License

The examples and skills in this repository are MIT licensed. See [LICENSE](LICENSE). Use of the ScrapingBot API is subject to the terms at [scrapingbot.io](https://scrapingbot.io/?utm_source=github&utm_medium=readme&utm_campaign=repo).
