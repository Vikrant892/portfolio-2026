// Records one unique visitor per IP. Only a salted SHA-256 hash of the IP is
// stored, never the raw address. Entries expire after ~180 days so the
// counter never becomes a permanent visitor register.
//
// Requires the VISIT_SALT secret (wrangler pages secret put VISIT_SALT);
// without it the endpoint refuses to record rather than falling back to a
// guessable hard-coded salt.
const RETENTION_SECONDS = 60 * 60 * 24 * 180;

export async function onRequestPost({ request, env }) {
  if (!env.VISITS || !env.VISIT_SALT) {
    return json({ ok: false, error: "not-configured" }, 503);
  }

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const bytes = new TextEncoder().encode(`${env.VISIT_SALT}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);

  const key = `ip:${hash}`;
  const seen = await env.VISITS.get(key);
  if (!seen) {
    await env.VISITS.put(key, new Date().toISOString(), {
      expirationTtl: RETENTION_SECONDS,
    });
  }

  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
