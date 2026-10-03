"""A public TikTok profile, then its latest videos. 1 credit per call.
Usage: python tiktok_user.py [username]"""
import sys

from scrapingbot import data_api

handle = sys.argv[1] if len(sys.argv) > 1 else "tiktok"

info = data_api("tiktok", "/user/info", unique_id=handle)["data"]
user, stats = info["user"], info["stats"]
print(f"@{user['uniqueId']} ({user['nickname']}): {stats['followerCount']:,} followers, {stats['videoCount']:,} videos")

page = data_api("tiktok", "/user/posts", unique_id=handle, count=10)["data"]
for v in page.get("videos", []):
    print(f"{v['video_id']}  {v.get('play_count', 0):>12,} plays  {v.get('title', '')[:60]}")
# More pages: pass cursor=page["cursor"] while page["hasMore"] is truthy.
