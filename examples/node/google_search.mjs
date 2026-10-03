// Google web results as JSON. 10 credits.
// Usage: node google_search.mjs "your query" [country]
import { dataApi } from "./scrapingbot.mjs";

const q = process.argv[2] ?? "best espresso machine";
const gl = process.argv[3] ?? "us";

const res = await dataApi("google", "/search", { q, gl });
for (const r of res.organic ?? []) console.log(`${String(r.position).padStart(2)}. ${r.title}\n    ${r.link}`);
for (const qa of (res.peopleAlsoAsk ?? []).slice(0, 3)) console.log("People also ask:", qa.question);
