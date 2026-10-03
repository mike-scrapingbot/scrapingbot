"""Search Amazon, then fetch full details for the first result. 10 credits per call.
Usage: python amazon_product.py ["search query"]"""
import sys

from scrapingbot import data_api

query = sys.argv[1] if len(sys.argv) > 1 else "wireless earbuds"

results = data_api("amazon", "/search", query=query)["data"]
products = results.get("products", [])
for p in products[:5]:
    print(f"{p['asin']}  {p.get('product_price') or '-':>8}  {p.get('product_star_rating') or '-'}*  {p['product_title'][:60]}")
if not products:
    sys.exit("No results")

d = data_api("amazon", "/product-details", asin=products[0]["asin"])["data"]
print(f"\n{d['product_title']}\n{d.get('product_price')} {d.get('currency', '')} · {d.get('product_availability')} · {d.get('product_num_ratings')} ratings")
for bullet in (d.get("about_product") or [])[:3]:
    print(" -", bullet[:100])
