"""Google web results as JSON. 10 credits.
Usage: python google_search.py "your query" [country]"""
import sys

from scrapingbot import data_api

q = sys.argv[1] if len(sys.argv) > 1 else "best espresso machine"
gl = sys.argv[2] if len(sys.argv) > 2 else "us"

res = data_api("google", "/search", q=q, gl=gl)
for r in res.get("organic", []):
    print(f"{r['position']:>2}. {r['title']}\n    {r['link']}")
for qa in res.get("peopleAlsoAsk", [])[:3]:
    print("People also ask:", qa.get("question"))
