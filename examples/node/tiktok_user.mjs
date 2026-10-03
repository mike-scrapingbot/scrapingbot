// A public TikTok profile, then its latest videos. 1 credit per call.
// Usage: node tiktok_user.mjs [username]
import { dataApi } from "./scrapingbot.mjs";

const handle = process.argv[2] ?? "tiktok";

const { data: info } = await dataApi("tiktok", "/user/info", { unique_id: handle });
console.log(`@${info.user.uniqueId} (${info.user.nickname}): ${info.stats.followerCount.toLocaleString()} followers, ${info.stats.videoCount.toLocaleString()} videos`);

const { data: page } = await dataApi("tiktok", "/user/posts", { unique_id: handle, count: 10 });
for (const v of page.videos ?? []) {
  console.log(`${v.video_id}  ${(v.play_count ?? 0).toLocaleString().padStart(12)} plays  ${(v.title ?? "").slice(0, 60)}`);
}
// More pages: pass cursor: page.cursor while page.hasMore is truthy.
