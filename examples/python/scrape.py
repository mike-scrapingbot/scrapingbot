"""Fetch a page's HTML. 1 credit (5 with render_js).
Usage: python scrape.py [url] [--render]"""
import sys

from scrapingbot import call

url = next((a for a in sys.argv[1:] if not a.startswith("--")), "https://example.com")
params = {"url": url}
if "--render" in sys.argv:
    params["render_js"] = "true"

res = call("/scrape", params=params)
if not res.get("success"):
    # fault "user": the page answered 400/404 (charged); "system"/"timeout": refunded.
    sys.exit(f"{res.get('status')} {res.get('fault', '')}: {res.get('error')}")
print(f"status {res['status']}, {len(res['html'])} chars of HTML, {res['credits_used']} credits, job {res['job_id']}")
print(res["html"][:500])
