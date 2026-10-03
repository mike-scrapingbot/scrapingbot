"""Have AI pull fields out of a page as JSON. 1 credit for the page + 5 for AI.
Usage: python extract.py [url]"""
import json
import sys

from scrapingbot import call

url = sys.argv[1] if len(sys.argv) > 1 else "https://books.toscrape.com/"
schema = {
    "type": "object",
    "properties": {
        "books": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "price": {"type": "string", "description": "Price with currency symbol"},
                    "in_stock": {"type": "boolean"},
                },
            },
        }
    },
}

res = call("/scrape", body={"url": url, "ai_schema": schema})
if not res.get("success"):
    sys.exit(f"{res.get('status')}: {res.get('error')}")
if res.get("ai_error"):
    sys.exit(f"Page fetched but extraction failed: {res['ai_error']}")
print(json.dumps(res["ai_result"], indent=2))
print(f"credits used: {res['credits_used']}")
