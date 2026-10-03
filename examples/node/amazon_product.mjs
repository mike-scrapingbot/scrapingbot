// Search Amazon, then fetch full details for the first result. 10 credits per call.
// Usage: node amazon_product.mjs ["search query"]
import { dataApi } from "./scrapingbot.mjs";

const query = process.argv[2] ?? "wireless earbuds";

const { data: results } = await dataApi("amazon", "/search", { query });
const products = results.products ?? [];
for (const p of products.slice(0, 5)) {
  console.log(`${p.asin}  ${String(p.product_price ?? "-").padStart(8)}  ${p.product_star_rating ?? "-"}*  ${p.product_title.slice(0, 60)}`);
}
if (!products.length) process.exit(1);

const { data: d } = await dataApi("amazon", "/product-details", { asin: products[0].asin });
console.log(`\n${d.product_title}\n${d.product_price} ${d.currency ?? ""} · ${d.product_availability} · ${d.product_num_ratings} ratings`);
for (const bullet of (d.about_product ?? []).slice(0, 3)) console.log(" -", bullet.slice(0, 100));
