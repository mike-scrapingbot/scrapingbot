// Have AI pull fields out of a page as JSON. 1 credit for the page + 5 for AI.
// Usage: node extract.mjs [url]
import { call } from "./scrapingbot.mjs";

const url = process.argv[2] ?? "https://books.toscrape.com/";
const ai_schema = {
  type: "object",
  properties: {
    books: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          price: { type: "string", description: "Price with currency symbol" },
          in_stock: { type: "boolean" },
        },
      },
    },
  },
};

const res = await call("/scrape", { body: { url, ai_schema } });
if (!res.success) {
  console.error(`${res.status}: ${res.error}`);
  process.exit(1);
}
if (res.ai_error) {
  console.error(`Page fetched but extraction failed: ${res.ai_error}`);
  process.exit(1);
}
console.log(JSON.stringify(res.ai_result, null, 2));
console.log(`credits used: ${res.credits_used}`);
