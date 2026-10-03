// Minimal ScrapingBot client shared by the examples. Node 18+ (built-in fetch), no dependencies.
const API = "https://scrapingbot.io/api/v1";
const RETRY = new Set([408, 429, 500, 503]); // refunded, safe to retry

function key() {
  const k = process.env.SCRAPINGBOT_API_KEY;
  if (!k) {
    console.error("Set SCRAPINGBOT_API_KEY (get one free at https://scrapingbot.io/auth/register)");
    process.exit(1);
  }
  return k;
}

/** POST (with body) or GET (with query) an API route; retries refunded failures with backoff. */
export async function call(path, { body, query, attempts = 4 } = {}) {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, String(v));
  let data;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: { "x-api-key": key(), ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(90_000),
    });
    data = await res.json().catch(() => ({ success: false, status: res.status, error: `HTTP ${res.status}` }));
    if (!RETRY.has(res.status) || attempt === attempts - 1) return data;
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
  return data;
}

/** Call /tiktok, /instagram, /google or /amazon. Exits with the error message on failure. */
export async function dataApi(api, endpoint, params = {}) {
  const res = await call(`/${api}`, { body: { endpoint, params } });
  if (!res.success) {
    console.error(`${api} ${endpoint} failed: ${res.error}`);
    process.exit(1);
  }
  return res;
}
