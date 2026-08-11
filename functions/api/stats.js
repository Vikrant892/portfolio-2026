// Unique-visitor count for the hidden Ctrl+Alt+H owner overlay.
// Protected: requires `Authorization: Bearer <STATS_TOKEN>`; without the
// secret configured the endpoint stays closed.
const TRACKING_SINCE = "11 AUG 2026";

export async function onRequestGet({ request, env }) {
  if (!env.VISITS || !env.STATS_TOKEN) {
    return json({ error: "not-configured" }, 503);
  }

  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !timingSafeEqual(token, env.STATS_TOKEN)) {
    return json({ error: "unauthorized" }, 401);
  }

  let unique = 0;
  let cursor;
  do {
    const page = await env.VISITS.list({ prefix: "ip:", cursor, limit: 1000 });
    unique += page.keys.length;
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return json({ unique, since: TRACKING_SINCE });
}

// Constant-time comparison so the token cannot be guessed byte by byte.
function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
