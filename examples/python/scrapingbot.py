"""Minimal ScrapingBot client shared by the examples. Requires: pip install requests"""
import os
import sys
import time

import requests

API = "https://scrapingbot.io/api/v1"
RETRY = {408, 429, 500, 503}  # refunded, safe to retry


def _key():
    key = os.environ.get("SCRAPINGBOT_API_KEY")
    if not key:
        sys.exit("Set SCRAPINGBOT_API_KEY (get one free at https://scrapingbot.io/auth/register)")
    return key


def call(path, body=None, params=None, attempts=4):
    """POST (with body) or GET (with params) an API route; retries refunded failures with backoff."""
    headers = {"x-api-key": _key()}
    for attempt in range(attempts):
        if body is not None:
            r = requests.post(f"{API}{path}", json=body, headers=headers, timeout=90)
        else:
            r = requests.get(f"{API}{path}", params=params, headers=headers, timeout=90)
        try:
            data = r.json()
        except ValueError:
            data = {"success": False, "status": r.status_code, "error": f"HTTP {r.status_code}"}
        if r.status_code in RETRY and attempt < attempts - 1:
            time.sleep(2 ** attempt)
            continue
        return data
    return data


def data_api(api, endpoint, **params):
    """Call /tiktok, /instagram, /google or /amazon. Exits with the error message on failure."""
    res = call(f"/{api}", body={"endpoint": endpoint, "params": params})
    if not res.get("success"):
        sys.exit(f"{api} {endpoint} failed: {res.get('error')}")
    return res
