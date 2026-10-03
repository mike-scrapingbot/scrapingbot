"""A public Instagram profile, then its latest posts. 5 credits per call.
Usage: python instagram_user.py [username]"""
import sys

from scrapingbot import data_api

handle = sys.argv[1] if len(sys.argv) > 1 else "instagram"

profile = data_api("instagram", "/user/by_username", username=handle)["data"]
print(f"@{profile['username']} ({profile.get('full_name', '')}): {profile['follower_count']:,} followers")

# Post lists take the numeric user id from the profile.
posts = data_api("instagram", "/medias/by_user_id", user_id=profile["id"], count=12)["data"]
for edge in posts.get("edges", []):
    node = edge["node"]
    print(f"https://www.instagram.com/p/{node['code']}/  {node.get('like_count', 0):>10,} likes  {node.get('comment_count', 0):>7,} comments")
# More pages: pass end_cursor=posts["page_info"]["end_cursor"] while posts["page_info"]["has_next_page"].
