---
name: amazon-products
description: Get Amazon (amazon.com) product data as JSON through the ScrapingBot API - keyword search, full product details by ASIN, batches of up to 20 ASINs, search-box suggestions, Best Sellers and New Releases by department, deals, categories and sellers. Use for price checks, product comparisons, catalog research and keyword research on Amazon. Requires SCRAPINGBOT_API_KEY.
---

# Amazon product data with ScrapingBot

`POST https://scrapingbot.io/api/v1/amazon`, headers `x-api-key: $SCRAPINGBOT_API_KEY` and `Content-Type: application/json`.
Body: `{"endpoint": "<endpoint>", "params": {...}}`. **10 credits per call**, except `/products`: 10 per product returned. Charged only on success. Timeout 30 s.

## Endpoints

| endpoint | Use for | Params |
| --- | --- | --- |
| `/search` | Products for a keyword | `query`, `page` 1–100, `department` |
| `/product-details` | One product by ASIN | `asin` |
| `/products` | Up to 20 products in one call | `asins` (array or comma-separated) |
| `/autocomplete` | Search-box suggestions (keyword research) | `query`, `department` (e.g. `aps`), `limit` up to 20 |
| `/best-sellers`, `/new-releases` | Ranked lists for a department | `category` (department slug, below), `page` 1–100 |
| `/deals-v2` | Current deals, store-wide | `page` 1–100 |
| `/product-category-list` | Best Sellers subcategory names and links | none |
| `/seller-profile` | A seller's profile | `seller_id`, optional `asin` |
| `/seller-products` | A seller's listings | `seller_id`, `page` |

Any other endpoint returns `400 Unsupported Amazon endpoint` (there is no reviews endpoint).

`category` slugs: `electronics`, `pc`, `wireless`, `videogames`, `books`, `toys-and-games`, `home-garden`, `kitchen`, `appliances`, `beauty`, `hpc`, `grocery`, `fashion`, `sporting-goods`, `pet-supplies`, `baby-products`, `automotive`, `office-products`, `arts-crafts`, `musical-instruments`. Ids from `/product-category-list` are not valid `category` values.

## Example

```bash
curl -X POST "https://scrapingbot.io/api/v1/amazon" \
  -H "x-api-key: $SCRAPINGBOT_API_KEY" -H "Content-Type: application/json" \
  -d '{"endpoint": "/product-details", "params": {"asin": "B07ZPKN6YR"}}'
```

## Fields worth reading

Envelope: `success`, `parameters` (what was looked up), `data`, `duration`, `creditsUsed`.

- `/search`: `data.products[]` (`asin`, `product_title`, `product_price`, `product_original_price`, `currency`, `product_star_rating`, `product_num_ratings`, `is_prime`, `is_sponsored`, `product_url`, `product_photo`); `data.has_next_page`.
- `/product-details`: `data.product_title`, `product_price`, `product_star_rating`, `product_num_ratings`, `product_availability`, `sales_volume`, `category`, `about_product[]`, `product_photo`.
- `/products`: `data.items[]` (same shape as product details) and `data.errors[]` for ASINs that failed (those are refunded).
- `/best-sellers`, `/new-releases`: `data.products[]` with `rank`, `asin`, `product_title`, `product_star_rating`. `product_price` is often `null` here: send the ASINs to `/products` for prices.
- `/autocomplete`: `data.suggestions[].value`.
- `/deals-v2`: `data.products[]` with `product_price`, `product_original_price`, `discount_percentage`, `deal_badge`.

Pagination: increase `page`; for search stop when `data.has_next_page` is false, for rankings and deals stop at an empty page.

## Cost control

`/products` holds 10 credits per ASIN up front: 20 ASINs need 200 credits available or you get `402`. Prefer it over 20 separate `/product-details` calls (same price, one request, one concurrency slot).

## Errors

Errors look like `{"success": false, "error": "Missing required parameter: asin"}` and are never charged.
- `400`: missing param, more than 20 ASINs, or unsupported endpoint.
- `404`: product wasn't found.
- `401` bad key; `402` not enough credits (tell the user); `429` concurrency limit (free plan: 1 at a time; wait and retry).
- `408` / `5xx`: temporary; retry with backoff.

Docs: https://scrapingbot.io/docs/amazon
