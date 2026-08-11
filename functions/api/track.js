// Records one unique visitor per IP. Only a salted SHA-256 hash of the IP is
// stored, never the raw address, so the counter works without keeping
// personal data.
export async function onRequestPost({ request, env }) {
  if (!env.VISITS) {
    return json({ ok: false, error: "no-binding" }, 503);
  }

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const salt = env.VISIT_SALT || "vikrant69g-2026";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);

  const key = `ip:${hash}`;
  const seen = await env.VISITS.get(key);
  if (!seen) {
    await env.VISITS.put(key, new Date().toISOString());
  }

  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
