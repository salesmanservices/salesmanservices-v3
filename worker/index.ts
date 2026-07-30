/** Salesman Services V5 Worker.
 *
 * The public V4.3 HTML/CSS/JS remains the visual source of truth. V5 adds a
 * durable admin data layer, inventory controls, activity/analytics tracking,
 * backups, uploads and Google Sheet pricing sync around that same public site.
 */
import {
  handleImageOptimization,
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  BUCKET?: R2Bucket;
  SALESMAN_DATA?: KVNamespace;
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: {
          format: string;
          quality: number;
        }): Promise<{ response(): Response }>;
      };
    };
  };
  ADMIN_PASSWORD?: string;
  ADMIN_EMAIL?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type Account = {
  id?: string;
  type?: string;
  title?: string;
  price?: number | string | null;
  currency?: string;
  status?: string;
  tags?: string[];
  description?: string;
  image?: string;
  secondImage?: string;
  buy?: string;
  button?: string;
  soldDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Review = {
  id?: string;
  name?: string;
  source?: string;
  text?: string;
  rating?: number;
  visible?: boolean;
};

type Order = {
  id: string;
  customerId?: string;
  customerName: string;
  service: string;
  status: string;
  amount: number;
  currency: string;
  workerId?: string;
  createdAt: string;
  dueAt?: string;
  notes?: string;
};

type Customer = {
  id: string;
  name: string;
  discord?: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
};

type Worker = {
  id: string;
  name: string;
  discord?: string;
  role: string;
  active: boolean;
  rate?: number;
  notes?: string;
};

type Activity = {
  id: string;
  action: string;
  actor: string;
  detail?: string;
  createdAt: string;
};

type SiteState = {
  schemaVersion: number;
  accounts: Account[];
  reviews: Review[];
  orders: Order[];
  customers: Customer[];
  workers: Worker[];
  activity: Activity[];
  announcement: { enabled: boolean; text: string };
  settings: {
    discord: string;
    sellapp: string;
    sythe: string;
    googleSheetIds: string[];
    googleSheetTabs: string[];
    lastSheetSync: string | null;
    sheetSyncStatus: string;
    sheetSyncMessage: string;
  };
  content: {
    siteTitle: string;
    heroEyebrow: string;
    heroTitle: string;
    heroText: string;
    footerNote: string;
  };
  pricing?: Record<string, unknown>;
};

const DISCORD = "https://discord.gg/HkUCNNQtmG";
const SELLAPP = "https://salesman.sell.app/";
const SYTHE = "https://www.sythe.org/threads/ustunel66-vouches/";
const DEFAULT_SHEET_IDS = [
  "1YlfxUg-YXoYQX-QTlk9xjp96QTKmcqx07M6KSdB9LFY",
  "1YxjRyGfJaZqHiOrLwHtvJpFtYVY1X97xZVyow47NsMY",
  "1QqmF10smy_5dTBz1mp5WoLEm1q8Q_VKcoH0dDt9GUTs",
];
const DEFAULT_SHEET_TABS = [
  "Skill Price",
  "Quest List",
  "Minigames",
  "Infcapes",
];
const SITE_STATE_KEY = "site_data";
const KV_ANALYTICS_KEY = "analytics_events";
const KV_BACKUP_PREFIX = "backup:";

function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

function textResponse(
  text: string,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(text, {
    status,
    headers: {
      "content-type": "text/plain; charset=UTF-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

async function assetJson<T>(
  env: Env,
  request: Request,
  path: string,
): Promise<T> {
  const response = await env.ASSETS.fetch(
    new Request(new URL(path, request.url)),
  );
  if (!response.ok) throw new Error(`Asset unavailable: ${path}`);
  return response.json() as Promise<T>;
}

function now() {
  return new Date().toISOString();
}

function asString(value: unknown, fallback = "") {
  return value === null || value === undefined ? fallback : String(value);
}

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function defaultState(accounts: Account[], pricing?: Record<string, unknown>): SiteState {
  return {
    schemaVersion: 5,
    accounts: accounts.map((account) => ({
      ...account,
      status: String(account.status || "available").toLowerCase() === "sold"
        ? "sold"
        : "available",
    })),
    reviews: [],
    orders: [],
    customers: [],
    workers: [],
    activity: [],
    announcement: { enabled: false, text: "" },
    settings: {
      discord: DISCORD,
      sellapp: SELLAPP,
      sythe: SYTHE,
      googleSheetIds: [...DEFAULT_SHEET_IDS],
      googleSheetTabs: [...DEFAULT_SHEET_TABS],
      lastSheetSync: null,
      sheetSyncStatus: "never",
      sheetSyncMessage: "No pricing sync has run yet.",
    },
    content: {
      siteTitle: "SalesMan Services",
      heroEyebrow: "OSRS accounts & services",
      heroTitle: "Your grind, handled professionally.",
      heroText: "Browse live stock, calculate your service and speak directly with the team.",
      footerNote: "Not affiliated with Jagex Ltd.",
    },
    pricing,
  };
}

function normalizeState(input: unknown, fallback: SiteState): SiteState {
  const value = (input && typeof input === "object" ? input : {}) as Partial<SiteState>;
  const settings = (value.settings && typeof value.settings === "object"
    ? value.settings
    : {}) as Partial<SiteState["settings"]>;
  const content = value.content && typeof value.content === "object"
    ? value.content
    : {};
  return {
    ...fallback,
    ...value,
    schemaVersion: 5,
    accounts: Array.isArray(value.accounts) ? value.accounts : fallback.accounts,
    reviews: Array.isArray(value.reviews) ? value.reviews : [],
    orders: Array.isArray(value.orders) ? value.orders : [],
    customers: Array.isArray(value.customers) ? value.customers : [],
    workers: Array.isArray(value.workers) ? value.workers : [],
    activity: Array.isArray(value.activity) ? value.activity.slice(-250) : [],
    announcement: {
      enabled: Boolean(value.announcement?.enabled),
      text: asString(value.announcement?.text),
    },
    settings: {
      ...fallback.settings,
      ...settings,
      googleSheetIds: Array.isArray(settings.googleSheetIds)
        ? settings.googleSheetIds.map(String).filter(Boolean)
        : fallback.settings.googleSheetIds,
      googleSheetTabs: Array.isArray(settings.googleSheetTabs)
        ? settings.googleSheetTabs.map(String).filter(Boolean)
        : fallback.settings.googleSheetTabs,
    },
    content: { ...fallback.content, ...content },
  };
}

async function ensureSchema(env: Env) {
  if (!env.DB) return;
  await env.DB.batch([
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)",
    ),
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS analytics_events (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT NOT NULL, path TEXT NOT NULL, metadata TEXT NOT NULL, created_at TEXT NOT NULL)",
    ),
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS backups (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, created_by TEXT NOT NULL, snapshot TEXT NOT NULL)",
    ),
  ]);
}

async function readState(
  env: Env,
  request: Request,
  persist = false,
): Promise<SiteState> {
  const accounts = await assetJson<Account[]>(env, request, "/assets/accounts.json");
  const pricing = await assetJson<Record<string, unknown>>(
    env,
    request,
    "/assets/pricing.json",
  );
  const fallback = defaultState(accounts, pricing);
  if (env.DB) {
    await ensureSchema(env);
    const row = await env.DB
      .prepare("SELECT value FROM app_state WHERE key = ?1")
      .bind(SITE_STATE_KEY)
      .first<{ value: string }>();
    if (!row?.value) {
      if (persist) await saveState(env, fallback);
      return fallback;
    }
    try {
      return normalizeState(JSON.parse(row.value), fallback);
    } catch {
      if (persist) await saveState(env, fallback);
      return fallback;
    }
  }
  if (env.SALESMAN_DATA) {
    const raw = await env.SALESMAN_DATA.get(SITE_STATE_KEY);
    if (!raw) {
      if (persist) await saveState(env, fallback);
      return fallback;
    }
    try {
      return normalizeState(JSON.parse(raw), fallback);
    } catch {
      if (persist) await saveState(env, fallback);
      return fallback;
    }
  }
  return fallback;
}

async function saveState(env: Env, state: SiteState) {
  if (env.DB) {
    await ensureSchema(env);
    await env.DB
      .prepare(
        "INSERT INTO app_state (key, value, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      )
      .bind(SITE_STATE_KEY, JSON.stringify(state), now())
      .run();
    return;
  }
  if (env.SALESMAN_DATA) {
    await env.SALESMAN_DATA.put(SITE_STATE_KEY, JSON.stringify(state));
  }
}

async function logActivity(
  env: Env,
  state: SiteState,
  action: string,
  detail: string,
  actor = "Admin",
) {
  state.activity = [
    ...state.activity,
    {
      id: crypto.randomUUID(),
      action,
      actor,
      detail,
      createdAt: now(),
    },
  ].slice(-250);
  await saveState(env, state);
}

function publicAccount(account: Account) {
  return {
    id: asString(account.id),
    type: asString(account.type, "Account"),
    title: asString(account.title, "Untitled account"),
    price: account.price ?? null,
    currency: asString(account.currency, "USD"),
    status: asString(account.status, "available").toLowerCase() === "sold"
      ? "sold"
      : "available",
    tags: Array.isArray(account.tags)
      ? account.tags.map(String).slice(0, 20)
      : [],
    description: asString(account.description),
    image: asString(account.image),
    secondImage: asString(account.secondImage),
    buy: asString(account.buy),
    button: asString(account.button),
    soldDate: asString(account.soldDate),
  };
}

function publicState(state: SiteState) {
  return {
    accounts: state.accounts.map(publicAccount),
    reviews: state.reviews,
    announcement: state.announcement,
    content: state.content,
    settings: {
      discord: state.settings.discord,
      sellapp: state.settings.sellapp,
      sythe: state.settings.sythe,
    },
    meta: {
      version: 5,
      inventoryUpdatedAt: state.activity.find((entry) =>
        entry.action.toLowerCase().includes("account"),
      )?.createdAt ?? null,
      lastSheetSync: state.settings.lastSheetSync,
    },
  };
}

function inventoryPayload(accounts: Account[], url: URL) {
  const all = accounts.map(publicAccount);
  const status = String(url.searchParams.get("status") || "all").toLowerCase();
  const type = String(url.searchParams.get("type") || "").toLowerCase();
  const query = String(url.searchParams.get("q") || "").toLowerCase();
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit")) || 100, 1),
    500,
  );
  const filtered = all
    .filter((account) => {
      if (status !== "all" && account.status !== status) return false;
      if (type && account.type.toLowerCase() !== type) return false;
      if (
        query &&
        ![account.title, account.type, account.description, ...account.tags]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      return true;
    })
    .slice(0, limit);
  const availableAccounts = filtered.filter(
    (account) => account.status === "available",
  );
  const soldAccounts = filtered.filter((account) => account.status === "sold");
  return {
    source: "Salesman Services live inventory",
    generatedAt: now(),
    inventoryUpdatedAt: null,
    availableCount: all.filter((account) => account.status === "available").length,
    soldCount: all.filter((account) => account.status === "sold").length,
    accounts: filtered,
    availableAccounts,
    soldAccounts,
    instructions: [
      "Recommend only accounts whose status is available.",
      "Never offer, reserve, or quote a sold account as available.",
      "Use the listed price only when it is present; otherwise direct the visitor to Discord for a quote.",
      "Do not invent stock, prices, discounts, stats, quests, or account history.",
    ],
    contact: { discord: DISCORD, sellapp: SELLAPP },
  };
}

function inventoryText(payload: ReturnType<typeof inventoryPayload>) {
  const lines = [
    "SALESMAN SERVICES — LIVE ACCOUNT INVENTORY",
    `Generated: ${payload.generatedAt}`,
    `Available accounts: ${payload.availableCount}`,
    `Sold accounts retained for history: ${payload.soldCount}`,
    "",
    "MANDATORY AI RULES",
    ...payload.instructions.map((rule, index) => `${index + 1}. ${rule}`),
    "",
    "CURRENTLY AVAILABLE",
  ];
  for (const account of payload.availableAccounts) {
    lines.push(`- ${account.title}`);
    lines.push(`  Type: ${account.type}`);
    lines.push("  Status: AVAILABLE");
    lines.push(
      `  Price: ${
        account.price === null || account.price === ""
          ? "Contact Discord"
          : `${account.price} ${account.currency}`
      }`,
    );
    if (account.tags.length) lines.push(`  Tags: ${account.tags.join(", ")}`);
    if (account.description) lines.push(`  Description: ${account.description}`);
    if (account.buy) lines.push(`  Purchase/contact link: ${account.buy}`);
  }
  lines.push("", "SOLD — DO NOT OFFER AS AVAILABLE");
  if (!payload.soldAccounts.length) {
    lines.push("No sold accounts are currently listed.");
  }
  for (const account of payload.soldAccounts) {
    lines.push(`- ${account.title} — SOLD`);
  }
  lines.push("", `Discord: ${DISCORD}`, `SellApp: ${SELLAPP}`);
  return lines.join("\n");
}

function inventoryHtml(payload: ReturnType<typeof inventoryPayload>) {
  const escape = (value: unknown) =>
    String(value).replace(
      /[&<>"]/g,
      (char) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ||
        char,
    );
  const cards = payload.availableAccounts
    .map(
      (account) =>
        `<article><h2>${escape(account.title)}</h2><p><strong>Status:</strong> AVAILABLE</p><p><strong>Type:</strong> ${escape(account.type)}</p><p><strong>Price:</strong> ${
          account.price === null || account.price === ""
            ? "Contact Discord"
            : `${escape(account.price)} ${escape(account.currency)}`
        }</p>${
          account.description ? `<p>${escape(account.description)}</p>` : ""
        }${
          account.buy
            ? `<p><a href="${escape(account.buy)}">Purchase or ask about this account</a></p>`
            : ""
        }</article>`,
    )
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Salesman Services Live Inventory</title><meta name="description" content="Live OSRS account inventory from Salesman Services."><style>body{max-width:900px;margin:40px auto;padding:0 20px;font:16px/1.55 system-ui;background:#0d0e12;color:#f4f4f5}article{border:1px solid #353743;border-radius:12px;padding:18px;margin:16px 0;background:#15161c}a{color:#e5b63f}.muted{color:#aaa}li{margin:8px 0}</style></head><body><h1>Salesman Services — Live Inventory</h1><p class="muted">Generated ${escape(payload.generatedAt)} from the current published inventory.</p><h2>Rules for AI Assist</h2><ol>${payload.instructions
    .map((rule) => `<li>${escape(rule)}</li>`)
    .join("")}</ol><h2>Currently available (${payload.availableCount})</h2>${
    cards || "<p>No available accounts are currently listed.</p>"
  }<h2>Sold — never offer as available</h2><ul>${
    payload.soldAccounts.map((account) => `<li>${escape(account.title)} — SOLD</li>`).join("") ||
    "<li>No sold accounts are currently listed.</li>"
  }</ul><p>Discord: <a href="${DISCORD}">${DISCORD}</a><br>SellApp: <a href="${SELLAPP}">${SELLAPP}</a></p></body></html>`;
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createAdminToken(env: Env) {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `${expires}.admin`;
  const signature = await digest(`${payload}:${env.ADMIN_PASSWORD || ""}`);
  return `${payload}.${signature}`;
}

async function isAdmin(request: Request, env: Env) {
  if (!env.ADMIN_PASSWORD) return false;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || Number(parts[0]) < Date.now()) return false;
  const expected = await digest(`${parts[0]}.${parts[1]}:${env.ADMIN_PASSWORD}`);
  return parts[1] === "admin" && constantTimeEqual(parts[2], expected);
}

function actorName(env: Env) {
  return env.ADMIN_EMAIL || "Admin";
}

function requireAdmin(request: Request, env: Env) {
  return isAdmin(request, env);
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }
  return rows;
}

function columnIndex(headers: string[], names: string[]) {
  const normalized = headers.map((header) =>
    header.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );
  return normalized.findIndex((header) =>
    names.some((name) => header.includes(name)),
  );
}

function parsePricingSheet(sheet: string, rows: string[][], current: Record<string, unknown>) {
  if (rows.length < 2) return current;
  const headers = rows[0];
  const body = rows.slice(1);
  const lower = sheet.toLowerCase();
  if (lower.includes("skill")) {
    const skill = columnIndex(headers, ["skill", "name"]);
    const method = columnIndex(headers, ["method", "mode"]);
    const from = columnIndex(headers, ["from", "start", "level"]);
    const to = columnIndex(headers, ["to", "end", "level"]);
    const rate = columnIndex(headers, ["rate", "gp", "price", "usd"]);
    const skillRates = body
      .map((row) => ({
        skill: row[skill >= 0 ? skill : 0] || "",
        method: row[method >= 0 ? method : 1] || "Current method",
        from: asNumber(row[from >= 0 ? from : 2]),
        to: asNumber(row[to >= 0 ? to : 3]),
        rate: asNumber(row[rate >= 0 ? rate : row.length - 1]),
      }))
      .filter((row) => row.skill && row.from > 0 && row.to > row.from && row.rate > 0);
    return skillRates.length ? { ...current, skillRates } : current;
  }
  if (lower.includes("quest")) {
    const name = columnIndex(headers, ["quest", "name"]);
    const price = columnIndex(headers, ["usd", "price", "cost"]);
    const quests = body
      .map((row) => ({
        name: row[name >= 0 ? name : 0] || "",
        usd: asNumber(row[price >= 0 ? price : row.length - 1]),
      }))
      .filter((row) => row.name && row.usd > 0);
    return quests.length ? { ...current, quests } : current;
  }
  if (lower.includes("minigame")) {
    const game = columnIndex(headers, ["game", "minigame", "name"]);
    const item = columnIndex(headers, ["item", "reward", "tier"]);
    const price = columnIndex(headers, ["usd", "price", "cost"]);
    const minigames = body
      .map((row) => ({
        game: row[game >= 0 ? game : 0] || "",
        item: row[item >= 0 ? item : 1] || "Current reward",
        usd: asNumber(row[price >= 0 ? price : row.length - 1]),
      }))
      .filter((row) => row.game && row.usd > 0);
    return minigames.length ? { ...current, minigames } : current;
  }
  if (lower.includes("infcape") || lower.includes("cape")) {
    const name = columnIndex(headers, ["challenge", "cape", "name"]);
    const method = columnIndex(headers, ["method", "build", "gear"]);
    const price = columnIndex(headers, ["usd", "price", "cost"]);
    const capes = body
      .map((row) => ({
        name: row[name >= 0 ? name : 0] || "",
        method: row[method >= 0 ? method : 1] || "Current build",
        usd: asNumber(row[price >= 0 ? price : row.length - 1]),
      }))
      .filter((row) => row.name && row.usd > 0);
    return capes.length ? { ...current, capes } : current;
  }
  return current;
}

async function syncPricing(
  env: Env,
  request: Request,
  state: SiteState,
) {
  const ids = state.settings.googleSheetIds.length
    ? state.settings.googleSheetIds
    : DEFAULT_SHEET_IDS;
  const tabs = state.settings.googleSheetTabs.length
    ? state.settings.googleSheetTabs
    : DEFAULT_SHEET_TABS;
  let pricing = state.pricing || await assetJson<Record<string, unknown>>(
    env,
    request,
    "/assets/pricing.json",
  );
  const imported: string[] = [];
  const errors: string[] = [];
  for (const id of ids) {
    for (const tab of tabs) {
      try {
        const endpoint = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
          id,
        )}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
        const response = await fetch(endpoint, {
          headers: { accept: "text/csv" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const parsed = parsePricingSheet(tab, parseCsv(await response.text()), pricing);
        if (parsed !== pricing) {
          pricing = parsed;
          imported.push(`${tab} (${id.slice(0, 8)}…)`);
        }
      } catch (error) {
        errors.push(`${tab}: ${error instanceof Error ? error.message : "unavailable"}`);
      }
    }
  }
  state.pricing = pricing;
  state.settings.lastSheetSync = now();
  state.settings.sheetSyncStatus = imported.length ? "success" : "fallback";
  state.settings.sheetSyncMessage = imported.length
    ? `Imported ${imported.join(", ")}${errors.length ? `; ${errors.length} sheets kept previous values.` : ""}`
    : "No sheet could be imported; previous working prices were kept.";
  await logActivity(
    env,
    state,
    "Pricing sync",
    state.settings.sheetSyncMessage,
    actorName(env),
  );
  return { imported, errors, pricing: state.pricing, settings: state.settings };
}

async function analytics(env: Env) {
  let rows: Array<{ eventType: string; path: string; createdAt: string }> = [];
  if (env.DB) {
    await ensureSchema(env);
    const result = await env.DB
      .prepare(
        "SELECT event_type as eventType, path, created_at as createdAt FROM analytics_events ORDER BY id DESC LIMIT 1000",
      )
      .all<{ eventType: string; path: string; createdAt: string }>();
    rows = result.results || [];
  } else if (env.SALESMAN_DATA) {
    const raw = await env.SALESMAN_DATA.get(KV_ANALYTICS_KEY);
    try {
      rows = raw ? (JSON.parse(raw) as typeof rows) : [];
    } catch {
      rows = [];
    }
  }
  const byType: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  let last7Days = 0;
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 7;
  for (const row of rows) {
    byType[row.eventType] = (byType[row.eventType] || 0) + 1;
    byPath[row.path] = (byPath[row.path] || 0) + 1;
    if (Date.parse(row.createdAt) >= cutoff) last7Days += 1;
  }
  return { total: rows.length, last7Days, byType, byPath };
}

async function saveBackup(env: Env, state: SiteState, actor: string) {
  if (env.DB) {
    await ensureSchema(env);
    await env.DB
      .prepare(
        "INSERT INTO backups (created_at, created_by, snapshot) VALUES (?1, ?2, ?3)",
      )
      .bind(now(), actor, JSON.stringify(state))
      .run();
    await env.DB
      .prepare(
        "DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY id DESC LIMIT 20)",
      )
      .run();
    return;
  }
  if (env.SALESMAN_DATA) {
    const key = `${KV_BACKUP_PREFIX}${Date.now()}-${crypto.randomUUID()}`;
    await env.SALESMAN_DATA.put(
      key,
      JSON.stringify({ createdAt: now(), createdBy: actor, snapshot: state }),
      { expirationTtl: 60 * 60 * 24 * 90 },
    );
  }
}

function unauthorized(message = "Admin authentication required") {
  return json({ error: message }, 401, { "www-authenticate": "Bearer" });
}

async function handleAdmin(
  request: Request,
  env: Env,
  url: URL,
) {
  if (request.method === "GET" && url.pathname === "/api/admin/session") {
    return json({
      configured: Boolean(env.ADMIN_PASSWORD),
      authenticated: await isAdmin(request, env),
      email: env.ADMIN_EMAIL || null,
    });
  }
  if (request.method === "POST" && url.pathname === "/api/admin/login") {
    if (!env.ADMIN_PASSWORD) {
      return json({ error: "ADMIN_PASSWORD is not configured in the Site settings." }, 503);
    }
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    const supplied = await digest(asString(body.password));
    const expected = await digest(env.ADMIN_PASSWORD);
    if (!constantTimeEqual(supplied, expected)) {
      return json({ error: "Incorrect password." }, 401);
    }
    return json({ token: await createAdminToken(env), expiresIn: 43200 });
  }
  if (!(await requireAdmin(request, env))) return unauthorized();
  const state = await readState(env, request, true);
  if (request.method === "GET" && url.pathname === "/api/admin/data") {
    return json(state);
  }
  if (request.method === "PUT" && url.pathname === "/api/admin/data") {
    const incoming = await request.json().catch(() => ({}));
    const updated = normalizeState(incoming, state);
    updated.activity = state.activity;
    await logActivity(env, updated, "Data saved", "Admin data saved.", actorName(env));
    await saveBackup(env, updated, actorName(env));
    return json(updated);
  }
  if (request.method === "GET" && url.pathname === "/api/admin/analytics") {
    return json(await analytics(env));
  }
  if (request.method === "POST" && url.pathname === "/api/admin/sync-sheet") {
    return json(await syncPricing(env, request, state));
  }
  if (request.method === "GET" && url.pathname === "/api/admin/backup") {
    return new Response(JSON.stringify(state, null, 2), {
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "content-disposition": 'attachment; filename="salesman-v5-backup.json"',
        "cache-control": "no-store",
      },
    });
  }
  if (request.method === "POST" && url.pathname === "/api/admin/restore") {
    const incoming = await request.json().catch(() => ({}));
    const restored = normalizeState(incoming, state);
    await saveBackup(env, state, actorName(env));
    await logActivity(env, restored, "Backup restored", "A full V5 backup was restored.", actorName(env));
    return json(restored);
  }
  if (request.method === "POST" && url.pathname === "/api/admin/upload") {
    if (!env.BUCKET) return json({ error: "Image storage is not configured yet." }, 503);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "Choose an image first." }, 400);
    if (!file.type.startsWith("image/") || file.size > 8_000_000) {
      return json({ error: "Use an image smaller than 8 MB." }, 400);
    }
    const key = `accounts/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`;
    await env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
    });
    await logActivity(env, state, "Image uploaded", key, actorName(env));
    return json({ key, url: `/media/${key}` });
  }
  return json({ error: "Admin route not found." }, 404);
}

const worker = {
  async scheduled(
    _event: { cron?: string; scheduledTime?: number },
    env: Env,
    ctx: ExecutionContext,
  ) {
    if (!env.DB && !env.SALESMAN_DATA) return;
    const request = new Request(
      "https://salesmanservices.com/api/admin/sync-sheet",
      { method: "POST" },
    );
    const state = await readState(env, request, true);
    ctx.waitUntil(syncPricing(env, request, state).catch(() => undefined));
  },

  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/admin/")) {
      return handleAdmin(request, env, url);
    }

    if (request.method === "GET" && url.pathname.startsWith("/media/")) {
      if (!env.BUCKET) return new Response("Not found", { status: 404 });
      const object = await env.BUCKET.get(url.pathname.slice("/media/".length));
      if (!object) return new Response("Not found", { status: 404 });
      return new Response(object.body, {
        headers: {
          "content-type": object.httpMetadata?.contentType || "application/octet-stream",
          "cache-control": object.httpMetadata?.cacheControl || "public, max-age=31536000, immutable",
          etag: object.httpEtag,
        },
      });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      const publicResponse = await env.ASSETS.fetch(
        new Request(new URL("/site.html", request.url)),
      );
      // The normal Sites runtime always has site.html. The fallback keeps the
      // Vinext starter's health/render test useful when ASSETS is intentionally
      // mocked as unavailable.
      return publicResponse.ok ? publicResponse : handler.fetch(request, env, ctx);
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      const state = env.DB || env.SALESMAN_DATA ? await readState(env, request) : null;
      return json({
        ok: true,
        version: "5.0",
        publicSite: true,
        liveInventory: true,
        admin: Boolean(env.ADMIN_PASSWORD),
        storage: {
          d1: Boolean(env.DB),
          kv: Boolean(env.SALESMAN_DATA),
          r2: Boolean(env.BUCKET),
        },
        lastSheetSync: state?.settings.lastSheetSync || null,
      });
    }

    if (request.method === "GET" && url.pathname === "/api/pricing") {
      const state = env.DB || env.SALESMAN_DATA ? await readState(env, request) : null;
      const pricing = state?.pricing || await assetJson<unknown>(env, request, "/assets/pricing.json");
      return json(pricing, 200, { "cache-control": "public, max-age=300" });
    }

    if (request.method === "GET" && url.pathname === "/api/site-data") {
      const state = await readState(env, request);
      return json(publicState(state), 200, { "cache-control": "public, max-age=30" });
    }

    if (request.method === "POST" && url.pathname === "/api/event") {
      if (env.DB) {
        await ensureSchema(env);
        const body = (await request.json().catch(() => ({}))) as {
          type?: string;
          event?: string;
          path?: string;
          metadata?: Record<string, unknown>;
        };
        await env.DB
          .prepare(
            "INSERT INTO analytics_events (event_type, path, metadata, created_at) VALUES (?1, ?2, ?3, ?4)",
          )
          .bind(
            asString(body.type || body.event, "page_view").slice(0, 80),
            asString(body.path, url.pathname).slice(0, 300),
            JSON.stringify(body.metadata || {}).slice(0, 2000),
            now(),
          )
          .run();
      } else if (env.SALESMAN_DATA) {
        const body = (await request.json().catch(() => ({}))) as {
          type?: string;
          event?: string;
          path?: string;
        };
        const raw = await env.SALESMAN_DATA.get(KV_ANALYTICS_KEY);
        let events: Array<{ eventType: string; path: string; createdAt: string }> = [];
        try {
          events = raw ? (JSON.parse(raw) as typeof events) : [];
        } catch {
          events = [];
        }
        events.push({
          eventType: asString(body.type || body.event, "page_view").slice(0, 80),
          path: asString(body.path, url.pathname).slice(0, 300),
          createdAt: now(),
        });
        await env.SALESMAN_DATA.put(
          KV_ANALYTICS_KEY,
          JSON.stringify(events.slice(-1000)),
          { expirationTtl: 60 * 60 * 24 * 400 },
        );
      }
      return new Response(null, { status: 204 });
    }

    if (
      request.method === "GET" &&
      ["/api/ai-inventory", "/api/ai/inventory", "/ai-inventory", "/ai-inventory/", "/ai-inventory.txt"].includes(
        url.pathname,
      )
    ) {
      const state = await readState(env, request);
      const payload = inventoryPayload(state.accounts, url);
      if (url.pathname === "/ai-inventory.txt") {
        return textResponse(inventoryText(payload), 200, {
          "cache-control": "public, max-age=30",
          "x-robots-tag": "index, follow",
        });
      }
      if (url.pathname === "/ai-inventory" || url.pathname === "/ai-inventory/") {
        return new Response(inventoryHtml(payload), {
          headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "public, max-age=30" },
        });
      }
      return json(payload, 200, {
        "cache-control": "public, max-age=30",
        "access-control-allow-origin": "*",
      });
    }

    if (url.pathname === "/_vinext/image" && env.IMAGES) {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) =>
            env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES!.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
            return result.response();
          },
        },
        allowedWidths,
      );
    }

    // Keep the public V4.3 route completely unchanged.
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
