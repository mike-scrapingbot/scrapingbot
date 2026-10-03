// Fetch a page's HTML. 1 credit (5 with render_js).
// Usage: node scrape.mjs [url] [--render]
import { call } from "./scrapingbot.mjs";

const url = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "https://example.com";
const query = { url };
if (process.argv.includes("--render")) query.render_js = "true";

const res = await call("/scrape", { query });
if (!res.success) {
  // fault "user": the page answered 400/404 (charged); "system"/"timeout": refunded.
  console.error(`${res.status} ${res.fault ?? ""}: ${res.error}`);
  process.exit(1);
}
console.log(`status ${res.status}, ${res.html.length} chars of HTML, ${res.credits_used} credits, job ${res.job_id}`);
console.log(res.html.slice(0, 500));
