// Returns the unique visitor count for the hidden Ctrl+Alt+H overlay.
const TRACKING_SINCE = "11 AUG 2026";

export async function onRequestGet({ env }) {
  if (!env.VISITS) {
    return json({ unique: 0, since: TRACKING_SINCE, error: "no-binding" }, 503);
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

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
