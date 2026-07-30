const DEFAULT_DATA = {
  accounts: null,
  reviews: [],
  orders: [],
  workers: [],
  customers: [],
  activity: [],
  content: { promotion: "", maintenance: false, featuredAccountId: "" },
  sheetSync: { enabled: true, spreadsheetId: "1YxjRyGfJaZqHiOrLwHtvJpFtYVY1X97xZVyow47NsMY", lastSync: null, status: "never", imported: 0, error: "" },
  announcement: { enabled: false, text: "" },
  settings: {
    discord: "https://discord.gg/HkUCNNQtmG",
    sellapp: "https://salesman.sell.app/"
  },
  meta: { version: 5 }
};

const SITE_KEY = "site-data";
const BACKUP_PREFIX = "backup:";
const EVENT_PREFIX = "events:";
const ANALYTICS_PREFIX = "analytics:";
const PRICING_KEY = "pricing-live";
const PRICE_HISTORY_PREFIX = "pricing-history:";
const LOGIN_PREFIX = "login:";
const SESSION_COOKIE = "salesman_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

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

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; }
  catch { return false; }
}

function constantTimeEqual(a, b) {
  const aa = encoder.encode(String(a));
  const bb = encoder.encode(String(b));
  const length = Math.max(aa.length, bb.length);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < length; i++) diff |= (aa[i] || 0) ^ (bb[i] || 0);
  return diff === 0;
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(`salesman-v4:${secret}`),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

async function createSession(secret) {
  const payload = `${Date.now() + SESSION_SECONDS * 1000}.${crypto.randomUUID()}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

async function validateToken(token, secret) {
  if (!token || !secret) return false;
  const parts = String(token).split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = await hmac(secret, payload);
  if (!constantTimeEqual(parts[2], expected)) return false;
  const expires = Number(parts[0]);
  return Number.isFinite(expires) && expires > Date.now();
}

async function validSession(request, env) {
  const secret = String(env.ADMIN_PASSWORD || "");
  if (!secret) return false;

  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\s*)${SESSION_COOKIE}=([^;]+)`));
  if (match && await validateToken(decodeURIComponent(match[1]), secret)) return true;

  const authorization = request.headers.get("Authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return validateToken(authorization.slice(7).trim(), secret);
  }
  return false;
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

async function loginState(request, env) {
  const key = `${LOGIN_PREFIX}${clientIp(request)}`;
  let state = { count: 0, blockedUntil: 0 };
  try { state = JSON.parse((await env.SALESMAN_DATA.get(key)) || JSON.stringify(state)); } catch {}
  return { key, state };
}

async function failedLogin(request, env) {
  const { key, state } = await loginState(request, env);
  const now = Date.now();
  if (state.blockedUntil < now) state.count = 0;
  state.count += 1;
  if (state.count >= 8) state.blockedUntil = now + 15 * 60 * 1000;
  await env.SALESMAN_DATA.put(key, JSON.stringify(state), { expirationTtl: 60 * 60 });
  return state;
}

async function clearLoginState(request, env) {
  await env.SALESMAN_DATA.delete(`${LOGIN_PREFIX}${clientIp(request)}`);
}

async function bundledAccounts(env, url) {
  try {
    const response = await env.ASSETS.fetch(new Request(new URL("/assets/accounts.json", url)));
    if (!response.ok) return [];
    const accounts = await response.json();
    return Array.isArray(accounts) ? accounts : [];
  } catch { return []; }
}

async function getStoredData(env) {
  const raw = await env.SALESMAN_DATA.get(SITE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function getHydratedData(env, url) {
  const stored = await getStoredData(env);
  const data = stored || structuredClone(DEFAULT_DATA);
  if (!Array.isArray(data.accounts)) data.accounts = await bundledAccounts(env, url);
  if (!Array.isArray(data.reviews)) data.reviews = [];
  data.announcement ||= { enabled: false, text: "" };
  data.settings ||= structuredClone(DEFAULT_DATA.settings);
  data.meta ||= {};
  data.orders ||= [];
  data.workers ||= [];
  data.customers ||= [];
  data.activity ||= [];
  data.content ||= { promotion: "", maintenance: false, featuredAccountId: "" };
  data.sheetSync ||= structuredClone(DEFAULT_DATA.sheetSync);
  return data;
}

function validateData(body) {
  if (!body || typeof body !== "object") return "Body must be a JSON object";
  if (!Array.isArray(body.accounts)) return "accounts must be an array";
  if (!Array.isArray(body.reviews)) return "reviews must be an array";
  if (!body.settings || typeof body.settings !== "object") return "settings must be an object";
  if (!body.announcement || typeof body.announcement !== "object") return "announcement must be an object";
  if (body.accounts.length > 500) return "Too many account records";
  if (body.orders && !Array.isArray(body.orders)) return "orders must be an array";
  if (body.workers && !Array.isArray(body.workers)) return "workers must be an array";
  if (body.customers && !Array.isArray(body.customers)) return "customers must be an array";
  return null;
}

async function createBackup(env, data, reason) {
  const timestamp = new Date().toISOString();
  const key = `${BACKUP_PREFIX}${timestamp}`;
  await env.SALESMAN_DATA.put(key, JSON.stringify({ timestamp, reason, actor: "password-admin", data }), {
    expirationTtl: 60 * 60 * 24 * 90
  });
  return key;
}

async function listBackups(env) {
  const listed = await env.SALESMAN_DATA.list({ prefix: BACKUP_PREFIX, limit: 30 });
  return listed.keys.map((entry) => ({ key: entry.name, timestamp: entry.name.slice(BACKUP_PREFIX.length) }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}


function publicAccount(account) {
  const status = String(account?.status || "available").toLowerCase() === "sold" ? "sold" : "available";
  return {
    id: String(account?.id || ""),
    type: String(account?.type || "Account"),
    title: String(account?.title || "Untitled account"),
    price: account?.price ?? null,
    currency: String(account?.currency || "EUR"),
    status,
    tags: Array.isArray(account?.tags) ? account.tags.map(String).slice(0, 20) : [],
    description: String(account?.description || ""),
    image: String(account?.image || ""),
    secondImage: String(account?.secondImage || ""),
    buy: String(account?.buy || ""),
    button: String(account?.button || ""),
    soldDate: String(account?.soldDate || "")
  };
}

function aiInventoryPayload(data, url) {
  const accounts = Array.isArray(data.accounts) ? data.accounts.map(publicAccount) : [];
  const typeFilter = String(url.searchParams.get("type") || "").trim().toLowerCase();
  const query = String(url.searchParams.get("q") || "").trim().toLowerCase();
  const requestedStatus = String(url.searchParams.get("status") || "all").trim().toLowerCase();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 100, 1), 500);

  const filtered = accounts.filter((account) => {
    if (requestedStatus === "available" && account.status !== "available") return false;
    if (requestedStatus === "sold" && account.status !== "sold") return false;
    if (typeFilter && account.type.toLowerCase() !== typeFilter) return false;
    if (query) {
      const haystack = [account.title, account.type, account.description, ...account.tags].join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  }).slice(0, limit);

  const availableAccounts = filtered.filter((account) => account.status === "available");
  const soldAccounts = filtered.filter((account) => account.status === "sold");
  const allAvailable = accounts.filter((account) => account.status === "available");
  const types = {};
  for (const account of allAvailable) types[account.type] = (types[account.type] || 0) + 1;

  return {
    source: "Salesman Services live inventory",
    generatedAt: new Date().toISOString(),
    inventoryUpdatedAt: data?.meta?.updatedAt || null,
    availableCount: allAvailable.length,
    soldCount: accounts.filter((account) => account.status === "sold").length,
    availableByType: types,
    accounts: filtered,
    availableAccounts,
    soldAccounts,
    instructions: [
      "Recommend only accounts whose status is available.",
      "Never offer, reserve, or quote a sold account as available.",
      "Use the listed price only when it is present; otherwise direct the visitor to Discord for a quote.",
      "Do not invent stock, prices, discounts, stats, quests, or account history.",
      "For purchase, negotiation, or a human agent, direct the visitor to the listed buy link or the Salesman Services Discord."
    ],
    contact: {
      discord: String(data?.settings?.discord || "https://discord.gg/HkUCNNQtmG"),
      sellapp: String(data?.settings?.sellapp || "https://salesman.sell.app/")
    }
  };
}

function aiInventoryText(payload) {
  const lines = [
    "SALESMAN SERVICES — LIVE ACCOUNT INVENTORY",
    `Generated: ${payload.generatedAt}`,
    payload.inventoryUpdatedAt ? `Inventory last changed: ${payload.inventoryUpdatedAt}` : "Inventory last changed: not recorded",
    `Available accounts: ${payload.availableCount}`,
    `Sold accounts retained for history: ${payload.soldCount}`,
    "",
    "MANDATORY AI RULES",
    ...payload.instructions.map((rule, index) => `${index + 1}. ${rule}`),
    "",
    "CURRENTLY AVAILABLE"
  ];

  if (!payload.availableAccounts.length) lines.push("No matching available accounts are currently listed.");
  for (const account of payload.availableAccounts) {
    lines.push(`- ${account.title}`);
    lines.push(`  Type: ${account.type}`);
    lines.push(`  Status: AVAILABLE`);
    lines.push(`  Price: ${account.price === null || account.price === "" ? "Contact Discord" : `${account.price} ${account.currency}`}`);
    if (account.tags.length) lines.push(`  Tags: ${account.tags.join(", ")}`);
    if (account.description) lines.push(`  Description: ${account.description}`);
    if (account.buy) lines.push(`  Purchase/contact link: ${account.buy}`);
  }

  lines.push("", "SOLD — DO NOT OFFER AS AVAILABLE");
  if (!payload.soldAccounts.length) lines.push("No matching sold accounts are listed.");
  for (const account of payload.soldAccounts) {
    lines.push(`- ${account.title} — SOLD${account.soldDate ? ` (${account.soldDate})` : ""}`);
  }

  lines.push("", `Discord: ${payload.contact.discord}`, `SellApp: ${payload.contact.sellapp}`);
  return lines.join("\n");
}

function aiInventoryHtml(payload) {
  const escape = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  const available = payload.availableAccounts.map((account) => `
    <article>
      <h2>${escape(account.title)}</h2>
      <p><strong>Status:</strong> AVAILABLE</p>
      <p><strong>Type:</strong> ${escape(account.type)}</p>
      <p><strong>Price:</strong> ${account.price === null || account.price === "" ? "Contact Discord" : `${escape(account.price)} ${escape(account.currency)}`}</p>
      ${account.tags.length ? `<p><strong>Tags:</strong> ${escape(account.tags.join(", "))}</p>` : ""}
      ${account.description ? `<p>${escape(account.description)}</p>` : ""}
      ${account.buy ? `<p><a href="${escape(account.buy)}">Purchase or ask about this account</a></p>` : ""}
    </article>`).join("") || "<p>No available accounts are currently listed.</p>";
  const sold = payload.soldAccounts.map((account) => `<li>${escape(account.title)} — SOLD${account.soldDate ? ` (${escape(account.soldDate)})` : ""}</li>`).join("") || "<li>No sold accounts are currently listed.</li>";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Salesman Services Live Inventory</title><meta name="description" content="Live account inventory for Salesman Services AI Assist."><style>body{max-width:900px;margin:40px auto;padding:0 20px;font:16px/1.55 system-ui;background:#0d0e12;color:#f4f4f5}article{border:1px solid #353743;border-radius:12px;padding:18px;margin:16px 0;background:#15161c}a{color:#e5b63f}code{background:#202129;padding:2px 6px;border-radius:5px}.muted{color:#aaa}li{margin:8px 0}</style></head><body><h1>Salesman Services — Live Inventory</h1><p class="muted">Generated ${escape(payload.generatedAt)}. This page is generated directly from the live admin inventory.</p><h2>Rules for AI Assist</h2><ol>${payload.instructions.map((rule) => `<li>${escape(rule)}</li>`).join("")}</ol><h2>Currently available (${payload.availableCount})</h2>${available}<h2>Sold — never offer as available</h2><ul>${sold}</ul><p>Discord: <a href="${escape(payload.contact.discord)}">${escape(payload.contact.discord)}</a><br>SellApp: <a href="${escape(payload.contact.sellapp)}">${escape(payload.contact.sellapp)}</a></p></body></html>`;
}


function csvRows(text) {
  const rows = []; let row = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (quoted) {
      if (c === '"' && n === '"') { value += '"'; i++; }
      else if (c === '"') quoted = false;
      else value += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(value); value = ""; }
    else if (c === '\n') { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += c;
  }
  if (value || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  return rows;
}
function num(value) {
  const clean = String(value ?? "").replace(/[$€£]/g, "").replace(/\s/g, "").replace(/,(?=\d{1,2}$)/, ".");
  const n = Number(clean); return Number.isFinite(n) ? n : null;
}
async function fetchSheetCsv(id, sheet) {
  const u = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
  const r = await fetch(u, { headers: { "user-agent": "SalesmanServices-V5" } });
  if (!r.ok) throw new Error(`${sheet}: Google returned ${r.status}`);
  return csvRows(await r.text());
}
function fillDown(rows, column) { let last = ""; return rows.map(r => { if (r[column]) last = r[column]; const x=[...r]; x[column]=last; return x; }); }
async function syncPricing(env, reason = "manual") {
  const data = await getStoredData(env) || structuredClone(DEFAULT_DATA);
  const id = String(data?.sheetSync?.spreadsheetId || DEFAULT_DATA.sheetSync.spreadsheetId);
  const fallbackRaw = await env.ASSETS.fetch(new Request('https://assets.local/assets/pricing.json'));
  const fallback = fallbackRaw.ok ? await fallbackRaw.json() : { skillRates: [], quests: [], minigames: [], capes: [] };
  try {
    const [skillsRaw, questsRaw, minigamesRaw, capesRaw] = await Promise.all([
      fetchSheetCsv(id, 'Skill Price'), fetchSheetCsv(id, 'Quest List'), fetchSheetCsv(id, 'Minigames'), fetchSheetCsv(id, 'infcapes')
    ]);
    const skillRates = skillsRaw.slice(1).map(r => ({ skill:String(r[1]||'').trim(), method:String(r[2]||'').trim(), from:num(r[3]), to:num(r[4]), rate:num(r[5]), notes:String(r[6]||'').trim() })).filter(x=>x.skill&&x.method&&x.from!==null&&x.to!==null&&x.rate!==null);
    const quests = questsRaw.slice(1).map(r => ({ name:String(r[0]||'').trim(), usd:num(r[1]), notes:String(r[2]||'').trim() })).filter(x=>x.name&&x.usd!==null);
    const minigames = fillDown(minigamesRaw.slice(1),0).map(r => ({ game:String(r[0]||'').trim(), item:String(r[1]||'').trim(), usd:num(r[2]), notes:String(r[3]||'').trim() })).filter(x=>x.game&&x.item&&x.usd!==null);
    const capes = fillDown(capesRaw.slice(1),0).map(r => ({ name:String(r[0]||'').trim(), method:String(r[1]||'').trim(), usd:num(r[2]), notes:String(r[3]||'').trim() })).filter(x=>x.name&&x.method&&x.usd!==null);
    if (skillRates.length < 10 || quests.length < 10) throw new Error('Sheet data was incomplete. Previous prices kept.');
    const pricing = { ...fallback, skillRates, quests, minigames: minigames.length ? minigames : fallback.minigames, capes: capes.length ? capes : fallback.capes, syncedAt:new Date().toISOString(), source:'Google Sheets', spreadsheetId:id };
    if (!pricing.skillGpPerXp && pricing.skillRates) pricing.skillGpPerXp = pricing.skillRates.map(x=>({skill:x.skill,method:x.method,from:x.from,to:x.to,gpPerXp:x.rate*1000000}));
    if (!pricing.displayGpRate) pricing.displayGpRate = fallback.displayGpRate || 0.27;
    const previous = await env.SALESMAN_DATA.get(PRICING_KEY);
    if (previous) await env.SALESMAN_DATA.put(`${PRICE_HISTORY_PREFIX}${new Date().toISOString()}`, previous, { expirationTtl: 60*60*24*90 });
    await env.SALESMAN_DATA.put(PRICING_KEY, JSON.stringify(pricing));
    data.sheetSync = { ...(data.sheetSync||{}), enabled:true, spreadsheetId:id, lastSync:pricing.syncedAt, status:'ok', imported:skillRates.length+quests.length+minigames.length+capes.length, error:'', reason };
    data.activity = [{ id:crypto.randomUUID(), at:pricing.syncedAt, type:'sheet-sync', text:`Google Sheet synced (${data.sheetSync.imported} prices)` }, ...(data.activity||[])].slice(0,500);
    await env.SALESMAN_DATA.put(SITE_KEY, JSON.stringify(data));
    return data.sheetSync;
  } catch (e) {
    data.sheetSync = { ...(data.sheetSync||{}), lastAttempt:new Date().toISOString(), status:'error', error:String(e.message||e), reason };
    data.activity = [{ id:crypto.randomUUID(), at:data.sheetSync.lastAttempt, type:'sheet-error', text:`Google Sheet sync failed: ${data.sheetSync.error}` }, ...(data.activity||[])].slice(0,500);
    await env.SALESMAN_DATA.put(SITE_KEY, JSON.stringify(data));
    throw e;
  }
}
async function getPricing(env) {
  const raw = await env.SALESMAN_DATA.get(PRICING_KEY);
  if (raw) try { return JSON.parse(raw); } catch {}
  const r = await env.ASSETS.fetch(new Request('https://assets.local/assets/pricing.json'));
  return r.ok ? r.json() : {};
}
function dayKey(offset=0){const d=new Date(Date.now()+offset*86400000);return d.toISOString().slice(0,10)}
async function analyticsSummary(env, days=30){
  const output={days:[],totals:{pageviews:0,visitors:0},events:{},countries:{},devices:{},pages:{},referrers:{}};
  for(let i=days-1;i>=0;i--){const day=dayKey(-i);let x={};try{x=JSON.parse((await env.SALESMAN_DATA.get(`${ANALYTICS_PREFIX}${day}`))||'{}')}catch{};output.days.push({day,pageviews:Number(x.pageviews||0),visitors:Number(x.visitors||0)});output.totals.pageviews+=Number(x.pageviews||0);output.totals.visitors+=Number(x.visitors||0);for(const group of ['events','countries','devices','pages','referrers'])for(const [k,v] of Object.entries(x[group]||{}))output[group][k]=(output[group][k]||0)+Number(v||0)}
  return output;
}
async function recordAnalytics(request, env) {
  let body={}; try{body=await request.json()}catch{}
  const day=dayKey(), key=`${ANALYTICS_PREFIX}${day}`; let x={pageviews:0,visitors:0,events:{},countries:{},devices:{},pages:{},referrers:{},visitorIds:{}};try{x={...x,...JSON.parse((await env.SALESMAN_DATA.get(key))||'{}')}}catch{}
  const event=String(body.name||body.event||'pageview').slice(0,80), page=String(body.page||'/').slice(0,160), visitor=String(body.visitor||clientIp(request)).slice(0,100);
  const country=String(request.cf?.country||'Unknown'), ua=request.headers.get('user-agent')||'', device=/mobile|android|iphone|ipad/i.test(ua)?'Mobile':'Desktop';
  x.pageviews+= event==='pageview'?1:0; if(!x.visitorIds[visitor]){x.visitorIds[visitor]=1;x.visitors+=1}
  x.events[event]=(x.events[event]||0)+1;x.pages[page]=(x.pages[page]||0)+1;x.countries[country]=(x.countries[country]||0)+1;x.devices[device]=(x.devices[device]||0)+1;
  const ref=String(body.referrer||'Direct').slice(0,120);x.referrers[ref]=(x.referrers[ref]||0)+1;
  const ids=Object.keys(x.visitorIds);if(ids.length>3000) x.visitorIds=Object.fromEntries(ids.slice(-2500).map(k=>[k,1]));
  await env.SALESMAN_DATA.put(key,JSON.stringify(x),{expirationTtl:60*60*24*400});
}
function addActivity(data, text, type='admin'){data.activity=[{id:crypto.randomUUID(),at:new Date().toISOString(),type,text},...(data.activity||[])].slice(0,500)}

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
  async scheduled(event, env, ctx) { ctx.waitUntil(syncPricing(env, "scheduled").catch(()=>{})); },
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.SALESMAN_DATA) {
      if (url.pathname.startsWith("/api/")) return json({ error: "SALESMAN_DATA KV binding is missing" }, 503);
      return env.ASSETS.fetch(request);
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, kv: true, adminConfigured: Boolean(env.ADMIN_PASSWORD), auth: "password", version: "5.0" });
    }

    if ((url.pathname === "/api/ai-inventory" || url.pathname === "/api/ai/inventory") && request.method === "GET") {
      const data = await getHydratedData(env, url);
      return json(aiInventoryPayload(data, url), 200, {
        "cache-control": "public, max-age=15, s-maxage=15",
        "access-control-allow-origin": "*"
      });
    }

    if (url.pathname === "/ai-inventory.txt" && request.method === "GET") {
      const data = await getHydratedData(env, url);
      const text = aiInventoryText(aiInventoryPayload(data, url));
      return new Response(text, { status: 200, headers: {
        "content-type": "text/plain; charset=UTF-8",
        "cache-control": "public, max-age=15, s-maxage=15",
        "x-robots-tag": "index, follow"
      }});
    }

    if ((url.pathname === "/ai-inventory" || url.pathname === "/ai-inventory/") && request.method === "GET") {
      const data = await getHydratedData(env, url);
      return new Response(aiInventoryHtml(aiInventoryPayload(data, url)), { status: 200, headers: {
        "content-type": "text/html; charset=UTF-8",
        "cache-control": "public, max-age=15, s-maxage=15",
        "x-content-type-options": "nosniff"
      }});
    }

    if (url.pathname === "/api/pricing" && request.method === "GET") {
      return json(await getPricing(env), 200, { "cache-control": "public, max-age=60, s-maxage=300", "access-control-allow-origin":"*" });
    }

    if (url.pathname === "/api/site-data" && request.method === "GET") {
      return json(await getHydratedData(env, url), 200, { "cache-control": "public, max-age=30" });
    }

    if (url.pathname === "/api/event" && request.method === "POST") {
      await recordEvent(request, env);
      await recordAnalytics(request, env);
      return new Response(null, { status: 204 });
    }

    if (url.pathname === "/api/admin/session" && request.method === "GET") {
      return json({ authenticated: await validSession(request, env), configured: Boolean(env.ADMIN_PASSWORD) });
    }

    if (url.pathname === "/api/admin/login" && request.method === "POST") {
      if (!sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
      if (!env.ADMIN_PASSWORD) return json({ error: "ADMIN_PASSWORD is not configured in Cloudflare" }, 503);
      const { state } = await loginState(request, env);
      if (state.blockedUntil > Date.now()) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
      let body = {};
      try { body = await request.json(); } catch {}
      if (!constantTimeEqual(body.password || "", env.ADMIN_PASSWORD)) {
        await failedLogin(request, env);
        return json({ error: "Incorrect password" }, 401);
      }
      await clearLoginState(request, env);
      const token = await createSession(env.ADMIN_PASSWORD);
      return json({ ok: true, token }, 200, { "set-cookie": sessionCookie(token) });
    }

    if (url.pathname === "/api/admin/logout" && request.method === "POST") {
      if (!sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
      return json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
    }

    if (url.pathname.startsWith("/api/admin/")) {
      if (!(await validSession(request, env))) return json({ error: "Admin login required" }, 401);
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !sameOrigin(request)) {
        return json({ error: "Invalid request origin" }, 403);
      }

      if (url.pathname === "/api/admin/dashboard" && request.method === "GET") {
        const data = await getHydratedData(env, url); const analytics = await analyticsSummary(env, 30);
        return json({ data, analytics, health:{version:"5.0",ai:true,website:true} });
      }
      if (url.pathname === "/api/admin/analytics" && request.method === "GET") return json(await analyticsSummary(env, Math.min(Number(url.searchParams.get('days'))||30,365)));
      if (url.pathname === "/api/admin/sync-prices" && request.method === "POST") {
        try { return json({ok:true,sync:await syncPricing(env,'manual')}); } catch(e){ return json({error:String(e.message||e)},502); }
      }
      if (url.pathname === "/api/admin/pricing" && request.method === "GET") return json(await getPricing(env));
      if (url.pathname === "/api/admin/data") {
        if (request.method === "GET") return json(await getHydratedData(env, url));
        if (request.method === "PUT") {
          let body;
          try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
          const validationError = validateData(body);
          if (validationError) return json({ error: validationError }, 400);
          const previous = await getHydratedData(env, url);
          await createBackup(env, previous, "before-save");
          addActivity(body, "Admin data saved", "save");
          body.meta = { ...(body.meta || {}), version: 5, updatedAt: new Date().toISOString(), updatedBy: "admin" };
          await env.SALESMAN_DATA.put(SITE_KEY, JSON.stringify(body));
          return json({ ok: true, savedAt: body.meta.updatedAt });
        }
      }

      if (url.pathname === "/api/admin/backups" && request.method === "GET") {
        return json({ backups: await listBackups(env) });
      }

      if (url.pathname === "/api/admin/restore" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
        if (!body.key || !String(body.key).startsWith(BACKUP_PREFIX)) return json({ error: "Invalid backup key" }, 400);
        const raw = await env.SALESMAN_DATA.get(String(body.key));
        if (!raw) return json({ error: "Backup not found" }, 404);
        const backup = JSON.parse(raw);
        const current = await getHydratedData(env, url);
        await createBackup(env, current, "before-restore");
        await env.SALESMAN_DATA.put(SITE_KEY, JSON.stringify(backup.data));
        return json({ ok: true, restored: body.key });
      }

      return json({ error: "Admin endpoint not found" }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};
