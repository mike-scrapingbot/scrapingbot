// A public Instagram profile, then its latest posts. 5 credits per call.
// Usage: node instagram_user.mjs [username]
import { dataApi } from "./scrapingbot.mjs";

const handle = process.argv[2] ?? "instagram";

const { data: profile } = await dataApi("instagram", "/user/by_username", { username: handle });
console.log(`@${profile.username} (${profile.full_name ?? ""}): ${profile.follower_count.toLocaleString()} followers`);

// Post lists take the numeric user id from the profile.
const { data: posts } = await dataApi("instagram", "/medias/by_user_id", { user_id: profile.id, count: 12 });
for (const { node } of posts.edges ?? []) {
  console.log(`https://www.instagram.com/p/${node.code}/  ${(node.like_count ?? 0).toLocaleString().padStart(10)} likes  ${(node.comment_count ?? 0).toLocaleString().padStart(7)} comments`);
}
// More pages: pass end_cursor: posts.page_info.end_cursor while posts.page_info.has_next_page.
