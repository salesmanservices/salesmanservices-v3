const DEFAULT_DATA = {
  accounts: null,
  reviews: [],
  announcement: { enabled: false, text: "" },
  settings: {
    discord: "https://discord.gg/HkUCNNQtmG",
    sellapp: "https://salesman.sell.app/"
  },
  meta: { version: 3 }
};

const SITE_KEY = "site-data";
const BACKUP_PREFIX = "backup:";
const EVENT_PREFIX = "events:";

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    }
  });
}

function adminEmail(request) {
  return (request.headers.get("Cf-Access-Authenticated-User-Email") || "").trim().toLowerCase();
}

function isAdmin(request, env) {
  const email = adminEmail(request);
  const allowed = (env.ADMIN_EMAIL || "").trim().toLowerCase();
  return Boolean(email && allowed && email === allowed);
}

async function bundledAccounts(env, url) {
  try {
    const response = await env.ASSETS.fetch(new Request(new URL("/assets/accounts.json", url)));
    if (!response.ok) return [];
    const accounts = await response.json();
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

async function getStoredData(env) {
  const raw = await env.SALESMAN_DATA.get(SITE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getHydratedData(env, url) {
  const stored = await getStoredData(env);
  const data = stored || structuredClone(DEFAULT_DATA);
  if (!Array.isArray(data.accounts)) data.accounts = await bundledAccounts(env, url);
  if (!Array.isArray(data.reviews)) data.reviews = [];
  data.announcement ||= { enabled: false, text: "" };
  data.settings ||= structuredClone(DEFAULT_DATA.settings);
  data.meta ||= {};
  return data;
}

function validateData(body) {
  if (!body || typeof body !== "object") return "Body must be a JSON object";
  if (!Array.isArray(body.accounts)) return "accounts must be an array";
  if (!Array.isArray(body.reviews)) return "reviews must be an array";
  if (!body.settings || typeof body.settings !== "object") return "settings must be an object";
  if (!body.announcement || typeof body.announcement !== "object") return "announcement must be an object";
  if (body.accounts.length > 500) return "Too many account records";
  return null;
}

async function createBackup(env, data, reason, email) {
  const timestamp = new Date().toISOString();
  const key = `${BACKUP_PREFIX}${timestamp}`;
  const payload = { timestamp, reason, email, data };
  await env.SALESMAN_DATA.put(key, JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 24 * 90
  });
  return key;
}

async function listBackups(env) {
  const listed = await env.SALESMAN_DATA.list({ prefix: BACKUP_PREFIX, limit: 30 });
  return listed.keys
    .map((entry) => ({ key: entry.name, timestamp: entry.name.slice(BACKUP_PREFIX.length) }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

async function recordEvent(request, env) {
  let body = {};
  try { body = await request.json(); } catch {}
  const name = String(body.name || body.event || "unknown").slice(0, 80);
  const day = new Date().toISOString().slice(0, 10);
  const key = `${EVENT_PREFIX}${day}`;
  let events = {};
  try { events = JSON.parse((await env.SALESMAN_DATA.get(key)) || "{}"); } catch {}
  events[name] = (Number(events[name]) || 0) + 1;
  await env.SALESMAN_DATA.put(key, JSON.stringify(events), { expirationTtl: 60 * 60 * 24 * 400 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.SALESMAN_DATA) {
      if (url.pathname.startsWith("/api/")) {
        return json({ error: "SALESMAN_DATA KV binding is missing" }, 503);
      }
      return env.ASSETS.fetch(request);
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, kv: true, adminConfigured: Boolean(env.ADMIN_EMAIL), version: 3 });
    }

    if (url.pathname === "/api/site-data" && request.method === "GET") {
      return json(await getHydratedData(env, url), 200, { "cache-control": "public, max-age=30" });
    }

    if (url.pathname === "/api/event" && request.method === "POST") {
      await recordEvent(request, env);
      return new Response(null, { status: 204 });
    }

    if (url.pathname.startsWith("/api/admin/")) {
      if (!isAdmin(request, env)) {
        return json({
          error: "Admin access required. Configure Cloudflare Access and set ADMIN_EMAIL to the same email address."
        }, 401);
      }

      if (url.pathname === "/api/admin/data") {
        if (request.method === "GET") return json(await getHydratedData(env, url));

        if (request.method === "PUT") {
          let body;
          try { body = await request.json(); }
          catch { return json({ error: "Invalid JSON" }, 400); }

          const validationError = validateData(body);
          if (validationError) return json({ error: validationError }, 400);

          const previous = await getHydratedData(env, url);
          await createBackup(env, previous, "before-save", adminEmail(request));

          body.meta = {
            ...(body.meta || {}),
            version: 3,
            updatedAt: new Date().toISOString(),
            updatedBy: adminEmail(request)
          };
          await env.SALESMAN_DATA.put(SITE_KEY, JSON.stringify(body));
          return json({ ok: true, savedAt: body.meta.updatedAt });
        }
      }

      if (url.pathname === "/api/admin/backups" && request.method === "GET") {
        return json({ backups: await listBackups(env) });
      }

      if (url.pathname === "/api/admin/restore" && request.method === "POST") {
        let body;
        try { body = await request.json(); }
        catch { return json({ error: "Invalid JSON" }, 400); }
        if (!body.key || !String(body.key).startsWith(BACKUP_PREFIX)) return json({ error: "Invalid backup key" }, 400);
        const raw = await env.SALESMAN_DATA.get(String(body.key));
        if (!raw) return json({ error: "Backup not found" }, 404);
        const backup = JSON.parse(raw);
        const current = await getHydratedData(env, url);
        await createBackup(env, current, "before-restore", adminEmail(request));
        await env.SALESMAN_DATA.put(SITE_KEY, JSON.stringify(backup.data));
        return json({ ok: true, restored: body.key });
      }

      return json({ error: "Admin endpoint not found" }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};
