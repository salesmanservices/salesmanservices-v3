const loginScreen = document.querySelector("#loginScreen");
const adminApp = document.querySelector("#adminApp");
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
const passwordInput = document.querySelector("#password");
const panel = document.querySelector("#panel");
const statusEl = document.querySelector("#status");
const SESSION_KEY = "salesman_admin_token";

let data = {
  accounts: [],
  reviews: [],
  orders: [],
  customers: [],
  workers: [],
  activity: [],
  announcement: { enabled: false, text: "" },
  settings: {},
  content: {},
};
let analytics = { total: 0, last7Days: 0, byType: {}, byPath: {} };
let activeTab = "dashboard";

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
      char
    ],
  );
const uid = (prefix) => `${prefix}-${crypto.randomUUID()}`;
const dateText = (value) =>
  value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

function authHeaders(extra = {}) {
  const token = localStorage.getItem(SESSION_KEY);
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function api(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: authHeaders(options.headers || {}),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function load() {
  const response = await api("/api/admin/data");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Access denied");
  data = {
    ...data,
    ...payload,
    accounts: payload.accounts || [],
    reviews: payload.reviews || [],
    orders: payload.orders || [],
    customers: payload.customers || [],
    workers: payload.workers || [],
    activity: payload.activity || [],
  };
  try {
    const analyticsResponse = await api("/api/admin/analytics");
    if (analyticsResponse.ok) analytics = await analyticsResponse.json();
  } catch {}
  render(activeTab);
  statusEl.textContent = "Connected";
}

async function start() {
  try {
    const response = await api("/api/admin/session");
    const session = await response.json();
    if (!session.configured) {
      loginScreen.hidden = false;
      adminApp.hidden = true;
      loginError.textContent =
        "ADMIN_PASSWORD is not configured in the Site settings yet.";
      return;
    }
    if (!session.authenticated) {
      localStorage.removeItem(SESSION_KEY);
      loginScreen.hidden = false;
      adminApp.hidden = true;
      return;
    }
    loginScreen.hidden = true;
    adminApp.hidden = false;
    await load();
  } catch (error) {
    loginScreen.hidden = false;
    adminApp.hidden = true;
    loginError.textContent =
      error.name === "AbortError"
        ? "Login check timed out. Refresh and try again."
        : `Connection error: ${error.message}`;
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button[type=submit]");
  button.disabled = true;
  loginError.textContent = "Logging in…";
  try {
    const response = await api("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: passwordInput.value }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Login failed");
    localStorage.setItem(SESSION_KEY, payload.token);
    passwordInput.value = "";
    await start();
  } catch (error) {
    loginError.textContent =
      error.name === "AbortError" ? "Login timed out. Try again." : error.message;
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#logout").addEventListener("click", async () => {
  try {
    await api("/api/admin/logout", { method: "POST" });
  } catch {}
  localStorage.removeItem(SESSION_KEY);
  location.reload();
});

function render(tab) {
  activeTab = tab;
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  ({
    dashboard: renderDashboard,
    accounts: renderAccounts,
    orders: renderOrders,
    customers: renderCustomers,
    workers: renderWorkers,
    analytics: renderAnalytics,
    reviews: renderReviews,
    content: renderContent,
    export: renderExport,
  })[tab]?.();
}

function statCard(label, value, hint = "") {
  return `<div class="card"><span>${esc(label)}</span><b>${esc(value)}</b>${hint ? `<small>${esc(hint)}</small>` : ""}</div>`;
}

function renderDashboard() {
  const available = data.accounts.filter((account) => account.status !== "sold").length;
  const sold = data.accounts.filter((account) => account.status === "sold").length;
  const activeOrders = data.orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status),
  ).length;
  const revenue = data.orders
    .filter((order) => order.status === "completed")
    .reduce((total, order) => total + Number(order.amount || 0), 0);
  panel.innerHTML = `
    <div class="toolbar"><div><span class="eyebrow">Salesman Services V5</span><h1>Overview</h1><p class="muted">One control room for the live website, stock and operations.</p></div><span class="pill success">Public design unchanged</span></div>
    <div class="cards">${statCard("Available accounts", available, "Live public stock")}${statCard("Sold history", sold, "Kept out of active stock")}${statCard("Open orders", activeOrders, "Orders awaiting delivery")}${statCard("Completed revenue", money(revenue), "From saved orders")}</div>
    <div class="split-panels"><article class="surface"><div class="surface-head"><h2>Recent activity</h2><button class="link-button" data-go="export">View all</button></div>${renderActivity(8)}</article><article class="surface"><div class="surface-head"><h2>Sheet sync</h2><button class="action small" id="quickSync">Sync now</button></div><p class="muted">${esc(data.settings?.sheetSyncMessage || "No pricing sync has run yet.")}</p><dl class="meta-list"><div><dt>Status</dt><dd>${esc(data.settings?.sheetSyncStatus || "never")}</dd></div><div><dt>Last sync</dt><dd>${dateText(data.settings?.lastSheetSync)}</dd></div></dl></article></div>`;
  document.querySelectorAll("[data-go]").forEach((button) => (button.onclick = () => render(button.dataset.go)));
  document.querySelector("#quickSync").onclick = syncSheet;
}

function renderActivity(limit = 20) {
  const entries = [...(data.activity || [])].reverse().slice(0, limit);
  if (!entries.length) return `<p class="empty">Activity will appear here as you work.</p>`;
  return `<div class="activity-list">${entries
    .map(
      (entry) =>
        `<div class="activity-item"><span class="activity-dot"></span><div><b>${esc(entry.action)}</b><p>${esc(entry.detail || "")}</p><small>${esc(entry.actor || "Admin")} · ${dateText(entry.createdAt)}</small></div></div>`,
    )
    .join("")}</div>`;
}

function renderAccounts() {
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">Inventory source of truth</span><h1>Accounts & pictures</h1><p class="muted">The status here controls what the public inventory and AI feed can offer.</p></div><button class="action" id="addAccount">+ Add account</button></div>
  <div class="notice info"><b>Keep SOLD accounts in history.</b><span>Mark an account sold instead of deleting it, so the AI feed never offers it again.</span></div>
  <div class="list">${data.accounts.map((account, index) => `<div class="row account-row"><img src="/${esc(account.image || "assets/accounts/zerker-1.png")}" alt=""><div class="account-title" data-edit-account="${index}"><b>${esc(account.title)}</b><small>${esc(account.type || "Account")} · ${account.status === "sold" ? "Sold" : "Available"}</small></div><input data-account="${index}" data-key="price" type="number" min="0" step="0.01" value="${esc(account.price ?? "")}" aria-label="Price"><select data-account="${index}" data-key="status" aria-label="Status"><option value="available" ${account.status !== "sold" ? "selected" : ""}>Available</option><option value="sold" ${account.status === "sold" ? "selected" : ""}>Sold</option></select><button class="icon-button danger" data-delete-account="${index}" title="Delete account">Delete</button></div>`).join("")}</div>`;
  document.querySelector("#addAccount").onclick = () => {
    data.accounts.unshift({
      id: uid("account"),
      type: "Account",
      title: "New OSRS Account",
      price: 0,
      image: "assets/accounts/zerker-1.png",
      tags: ["Negotiable"],
      description: "Edit this description.",
      buy: `/checkout?account=${encodeURIComponent("account")}`,
      button: "Buy securely",
      saleMethod: "crypto",
      status: "available",
      createdAt: new Date().toISOString(),
    });
    editAccount(0);
  };
  document.querySelectorAll("[data-edit-account]").forEach((node) => (node.onclick = () => editAccount(Number(node.dataset.editAccount))));
  document.querySelectorAll("[data-delete-account]").forEach((button) => {
    button.onclick = () => {
      if (!confirm("Delete this account? Mark it sold instead when possible.")) return;
      data.accounts.splice(Number(button.dataset.deleteAccount), 1);
      renderAccounts();
    };
  });
  bindDataInputs();
}

function editAccount(index) {
  const account = data.accounts[index];
  const fields = ["title", "type", "price", "image", "secondImage", "description", "buy", "button", "soldDate", "notes"];
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">Account editor</span><h1>Edit listing</h1></div><button class="secondary" id="backAccounts">← Back to accounts</button></div><div class="editor-grid">${fields.map((field) => field === "description" || field === "notes" ? `<label>${esc(field)}<textarea data-edit-account-field="${field}">${esc(account[field] || "")}</textarea></label>` : `<label>${esc(field)}<input data-edit-account-field="${field}" type="${field === "price" ? "number" : "text"}" value="${esc(account[field] ?? "")}"></label>`).join("")}<label>Tags (comma separated)<input id="accountTags" value="${esc((account.tags || []).join(", "))}"></label><label>Status<select id="accountStatus"><option value="available">Available</option><option value="sold">Sold</option></select></label><label>Sale method<select id="accountSaleMethod"><option value="crypto">Crypto Checkout (BTC/LTC)</option><option value="discord">Discord Only</option></select></label><label class="upload-field">Upload primary picture<input id="primaryUpload" type="file" accept="image/*"><small>Stored separately from the public design.</small></label><label class="upload-field">Upload second picture<input id="secondUpload" type="file" accept="image/*"></label></div><article class="surface" style="margin-top:18px"><div class="surface-head"><div><span class="eyebrow">Encrypted account vault</span><h2>Private delivery details</h2><p class="muted">These fields are encrypted and never included in the public inventory.</p></div><span class="pill" id="vaultStatus">Loading…</span></div><div class="editor-grid"><label>Account username<input id="vaultUsername" autocomplete="off"></label><label>Account password<input id="vaultPassword" type="password" autocomplete="new-password"></label><label>Registered email<input id="vaultEmail" autocomplete="off"></label><label>Email password<input id="vaultEmailPassword" type="password" autocomplete="new-password"></label><label class="wide">Recovery information<textarea id="vaultRecovery"></textarea></label><label class="wide">Extra delivery notes<textarea id="vaultNotes"></textarea></label></div><div class="editor-actions"><button class="action" id="saveVault">Save encrypted details</button><button class="secondary" id="previewDelivery">Preview delivery email</button></div><div id="deliveryPreview" class="notice info" style="display:none"></div></article><div class="editor-actions"><button class="action" id="saveAccount">Save listing</button><button class="secondary" id="cancelAccount">Cancel</button></div>`;
  document.querySelector("#accountStatus").value = account.status || "available";
  document.querySelector("#accountSaleMethod").value = account.saleMethod === "discord" ? "discord" : "crypto";
  const loadVault = async () => {
    const response = await api(`/api/admin/vault/${encodeURIComponent(account.id)}`);
    const payload = await response.json();
    if (!response.ok) { document.querySelector("#vaultStatus").textContent = payload.error || "Unavailable"; return; }
    document.querySelector("#vaultStatus").textContent = payload.configured ? "Encrypted & ready" : "Not configured";
    const c = payload.credentials || {};
    document.querySelector("#vaultUsername").value = c.username || ""; document.querySelector("#vaultPassword").value = c.password || "";
    document.querySelector("#vaultEmail").value = c.registeredEmail || ""; document.querySelector("#vaultEmailPassword").value = c.emailPassword || "";
    document.querySelector("#vaultRecovery").value = c.recoveryInfo || ""; document.querySelector("#vaultNotes").value = c.extraNotes || "";
  };
  document.querySelector("#saveVault").onclick = async () => {
    const credentials = { username: document.querySelector("#vaultUsername").value, password: document.querySelector("#vaultPassword").value, registeredEmail: document.querySelector("#vaultEmail").value, emailPassword: document.querySelector("#vaultEmailPassword").value, recoveryInfo: document.querySelector("#vaultRecovery").value, extraNotes: document.querySelector("#vaultNotes").value };
    const response = await api(`/api/admin/vault/${encodeURIComponent(account.id)}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(credentials) });
    const payload = await response.json(); if (!response.ok) return alert(payload.error || "Vault save failed");
    document.querySelector("#vaultStatus").textContent = "Encrypted & ready"; statusEl.textContent = "Secure details saved";
  };
  document.querySelector("#previewDelivery").onclick = () => {
    const value = (id) => esc(document.querySelector(id).value || "Not provided");
    const preview = document.querySelector("#deliveryPreview"); preview.style.display = "block";
    preview.innerHTML = `<b>Customer delivery preview</b><br><br>Username: ${value("#vaultUsername")}<br>Password: ${value("#vaultPassword")}<br>Registered email: ${value("#vaultEmail")}<br>Email password: ${value("#vaultEmailPassword")}<br>Recovery: ${value("#vaultRecovery")}<br>Notes: ${value("#vaultNotes")}<br><br><b>5% loyalty discount:</b> Leave feedback on Discord, Sythe, or the website to receive 5% off the next order.`;
  };
  loadVault();
  document.querySelector("#saveAccount").onclick = async () => {
    document.querySelectorAll("[data-edit-account-field]").forEach((field) => {
      account[field.dataset.editAccountField] = field.dataset.editAccountField === "price" ? Number(field.value || 0) : field.value;
    });
    account.tags = document.querySelector("#accountTags").value.split(",").map((tag) => tag.trim()).filter(Boolean);
    account.status = document.querySelector("#accountStatus").value;
    account.saleMethod = document.querySelector("#accountSaleMethod").value;
    account.buy = account.saleMethod === "discord"
      ? (data.settings?.discord || "https://discord.gg/xDSvKT3ThQ")
      : `/checkout?account=${encodeURIComponent(account.id)}`;
    account.button = account.saleMethod === "discord" ? "Buy through Discord" : "Buy with BTC / LTC";
    const primary = document.querySelector("#primaryUpload").files[0];
    const second = document.querySelector("#secondUpload").files[0];
    if (primary) account.image = await uploadImage(primary);
    if (second) account.secondImage = await uploadImage(second);
    renderAccounts();
  };
  document.querySelector("#cancelAccount").onclick = () => renderAccounts();
  document.querySelector("#backAccounts").onclick = () => renderAccounts();
}

async function uploadImage(file) {
  const body = new FormData();
  body.append("file", file);
  const response = await api("/api/admin/upload", { method: "POST", body });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Upload failed");
  return payload.url;
}

function renderOrders() {
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">Operations</span><h1>Orders</h1><p class="muted">Track service requests, assignment and delivery status.</p></div><button class="action" id="addOrder">+ Add order</button></div><div class="list">${data.orders.map((order, index) => `<div class="order-card"><div class="order-card-head"><b>${esc(order.id)}</b><select data-order="${index}" data-key="status"><option ${order.status === "pending_payment" ? "selected" : ""}>pending_payment</option><option ${order.status === "expired" ? "selected" : ""}>expired</option><option ${order.status === "paid" ? "selected" : ""}>paid</option><option ${order.status === "new" ? "selected" : ""}>new</option><option ${order.status === "in_progress" ? "selected" : ""}>in_progress</option><option ${order.status === "waiting_customer" ? "selected" : ""}>waiting_customer</option><option ${order.status === "completed" ? "selected" : ""}>completed</option><option ${order.status === "cancelled" ? "selected" : ""}>cancelled</option></select><button class="icon-button danger" data-delete-order="${index}">Delete</button></div><div class="order-grid"><label>Customer<input data-order="${index}" data-key="customerName" value="${esc(order.customerName)}"></label><label>Service<input data-order="${index}" data-key="service" value="${esc(order.service)}"></label><label>Amount<input data-order="${index}" data-key="amount" type="number" value="${esc(order.amount)}"></label><label>Currency<input data-order="${index}" data-key="currency" value="${esc(order.currency || "USD")}"></label><label>Worker ID<input data-order="${index}" data-key="workerId" value="${esc(order.workerId || "")}"></label><label>Due date<input data-order="${index}" data-key="dueAt" type="date" value="${esc((order.dueAt || "").slice(0, 10))}"></label><label>Payment status<input readonly value="${esc(order.paymentStatus || "manual")}"></label><label>Delivery status<input readonly value="${esc(order.deliveryStatus || "not sent")}"></label><label class="wide">Notes<textarea data-order="${index}" data-key="notes">${esc(order.notes || "")}</textarea></label>${order.deliveryError ? `<div class="notice danger wide"><b>Delivery error</b><span>${esc(order.deliveryError)}</span></div>` : ""}${["paid","completed"].includes(order.status) && order.deliveryStatus !== "sent" ? `<button class="secondary" data-retry-delivery="${index}">Retry delivery email</button>` : ""}</div></div>`).join("")}</div>`;
  document.querySelector("#addOrder").onclick = () => {
    data.orders.unshift({ id: uid("order"), customerName: "New customer", service: "Service request", status: "new", amount: 0, currency: "USD", createdAt: new Date().toISOString(), notes: "" });
    renderOrders();
  };
  document.querySelectorAll("[data-delete-order]").forEach((button) => (button.onclick = () => {
    const index = Number(button.dataset.deleteOrder);
    const order = data.orders[index];
    if (!order) return;
    if (["paid", "completed"].includes(String(order.status || "").toLowerCase())) {
      return alert("Paid or completed orders cannot be deleted. Keep them for delivery and audit history.");
    }
    if (!confirm("Delete this unpaid order and release its reserved account?")) return;
    const account = data.accounts.find((item) => String(item.id || "") === String(order.accountId || ""));
    if (account && String(account.status || "").toLowerCase() === "reserved" && String(account.reservedOrderId || "") === String(order.id || "")) {
      account.status = "available";
      delete account.reservedUntil;
      delete account.reservedOrderId;
    }
    data.orders.splice(index, 1);
    renderOrders();
  }));
  document.querySelectorAll("[data-retry-delivery]").forEach((button) => (button.onclick = async () => { const order = data.orders[Number(button.dataset.retryDelivery)]; const response = await api(`/api/admin/delivery/retry/${encodeURIComponent(order.id)}`, { method: "POST" }); const payload = await response.json(); if (!response.ok) return alert(payload.error || "Delivery failed"); Object.assign(order, payload); renderOrders(); }));
  bindDataInputs();
}

function renderCustomers() {
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">Relationships</span><h1>Customers</h1><p class="muted">Keep a lightweight record of repeat customers and contact details.</p></div><button class="action" id="addCustomer">+ Add customer</button></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Discord</th><th>Email</th><th>Orders</th><th>Spent</th><th></th></tr></thead><tbody>${data.customers.map((customer, index) => `<tr><td><input data-customer="${index}" data-key="name" value="${esc(customer.name)}"></td><td><input data-customer="${index}" data-key="discord" value="${esc(customer.discord || "")}"></td><td><input data-customer="${index}" data-key="email" value="${esc(customer.email || "")}"></td><td><input data-customer="${index}" data-key="totalOrders" type="number" value="${esc(customer.totalOrders || 0)}"></td><td><input data-customer="${index}" data-key="totalSpent" type="number" value="${esc(customer.totalSpent || 0)}"></td><td><button class="icon-button danger" data-delete-customer="${index}">Delete</button></td></tr>`).join("")}</tbody></table></div>`;
  document.querySelector("#addCustomer").onclick = () => { data.customers.unshift({ id: uid("customer"), name: "New customer", totalOrders: 0, totalSpent: 0, createdAt: new Date().toISOString() }); renderCustomers(); };
  document.querySelectorAll("[data-delete-customer]").forEach((button) => (button.onclick = () => { data.customers.splice(Number(button.dataset.deleteCustomer), 1); renderCustomers(); }));
  bindDataInputs();
}

function renderWorkers() {
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">Team</span><h1>Workers</h1><p class="muted">Assign service orders and keep active worker details in one place.</p></div><button class="action" id="addWorker">+ Add worker</button></div><div class="worker-grid">${data.workers.map((worker, index) => `<article class="worker-card"><div class="worker-head"><div class="avatar">${esc((worker.name || "W").slice(0, 1).toUpperCase())}</div><button class="icon-button danger" data-delete-worker="${index}">Delete</button></div><label>Name<input data-worker="${index}" data-key="name" value="${esc(worker.name)}"></label><label>Discord<input data-worker="${index}" data-key="discord" value="${esc(worker.discord || "")}"></label><label>Role<input data-worker="${index}" data-key="role" value="${esc(worker.role || "Skiller")}"></label><label>Rate<input data-worker="${index}" data-key="rate" type="number" value="${esc(worker.rate || 0)}"></label><label class="check"><input data-worker="${index}" data-key="active" type="checkbox" ${worker.active ? "checked" : ""}> Active</label><label>Notes<textarea data-worker="${index}" data-key="notes">${esc(worker.notes || "")}</textarea></label></article>`).join("")}</div>`;
  document.querySelector("#addWorker").onclick = () => { data.workers.unshift({ id: uid("worker"), name: "New worker", role: "Skiller", active: true, rate: 0 }); renderWorkers(); };
  document.querySelectorAll("[data-delete-worker]").forEach((button) => (button.onclick = () => { data.workers.splice(Number(button.dataset.deleteWorker), 1); renderWorkers(); }));
  bindDataInputs();
}

function renderAnalytics() {
  const typeRows = Object.entries(analytics.byType || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const pathRows = Object.entries(analytics.byPath || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">First-party analytics</span><h1>Analytics</h1><p class="muted">Lightweight, privacy-conscious counts from the public site.</p></div><button class="secondary" id="refreshAnalytics">Refresh</button></div><div class="cards">${statCard("Tracked events", analytics.total)}${statCard("Last 7 days", analytics.last7Days)}${statCard("Public accounts", data.accounts.length)}${statCard("Orders completed", data.orders.filter((order) => order.status === "completed").length)}</div><div class="split-panels"><article class="surface"><h2>Event types</h2>${barRows(typeRows)}</article><article class="surface"><h2>Popular paths</h2>${barRows(pathRows)}</article></div>`;
  document.querySelector("#refreshAnalytics").onclick = async () => { const response = await api("/api/admin/analytics"); if (response.ok) analytics = await response.json(); renderAnalytics(); };
}

function barRows(rows) {
  if (!rows.length) return `<p class="empty">No events yet. The public site will populate this as visitors interact.</p>`;
  const max = Math.max(...rows.map(([, count]) => count), 1);
  return `<div class="bar-list">${rows.map(([label, count]) => `<div class="bar-row"><div><span>${esc(label)}</span><b>${count}</b></div><i style="width:${Math.max(4, (count / max) * 100)}%"></i></div>`).join("")}</div>`;
}

function renderReviews() {
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">Social proof</span><h1>Reviews</h1><p class="muted">Publish only feedback you have permission to show.</p></div><button class="action" id="addReview">+ Add review</button></div><div class="review-grid">${data.reviews.map((review, index) => `<article class="review-card"><div class="review-head"><b>${esc(review.name || "Customer")}</b><button class="icon-button danger" data-delete-review="${index}">Delete</button></div><label>Source<input data-review="${index}" data-key="source" value="${esc(review.source || "Discord")}"></label><label>Feedback<textarea data-review="${index}" data-key="text">${esc(review.text || "")}</textarea></label><label class="check"><input data-review="${index}" data-key="visible" type="checkbox" ${review.visible !== false ? "checked" : ""}> Visible</label></article>`).join("")}</div>`;
  document.querySelector("#addReview").onclick = () => { data.reviews.unshift({ id: uid("review"), name: "Customer", source: "Discord", text: "Great service.", visible: true }); renderReviews(); };
  document.querySelectorAll("[data-delete-review]").forEach((button) => (button.onclick = () => { data.reviews.splice(Number(button.dataset.deleteReview), 1); renderReviews(); }));
  bindDataInputs();
}

function renderContent() {
  const content = data.content || {};
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">Public controls</span><h1>Content & links</h1><p class="muted">These values feed the public site and official contact buttons.</p></div></div><div class="editor-grid"><label>Site title<input id="siteTitle" value="${esc(content.siteTitle || "")}"></label><label>Hero eyebrow<input id="heroEyebrow" value="${esc(content.heroEyebrow || "")}"></label><label class="wide">Hero title<input id="heroTitle" value="${esc(content.heroTitle || "")}"></label><label class="wide">Hero text<textarea id="heroText">${esc(content.heroText || "")}</textarea></label><label class="wide">Footer note<input id="footerNote" value="${esc(content.footerNote || "")}"></label><label class="check wide"><input id="annEnabled" type="checkbox" ${data.announcement?.enabled ? "checked" : ""}> Enable website announcement</label><label class="wide">Announcement<textarea id="annText">${esc(data.announcement?.text || "")}</textarea></label><label>Discord link<input id="discord" value="${esc(data.settings?.discord || "")}"></label><label>Sythe vouch link<input id="sythe" value="${esc(data.settings?.sythe || "")}"></label><label class="wide">Google Sheet IDs (one per line)<textarea id="sheetIds">${esc((data.settings?.googleSheetIds || []).join("\n"))}</textarea></label><label class="wide">Google Sheet tabs (one per line)<textarea id="sheetTabs">${esc((data.settings?.googleSheetTabs || []).join("\n"))}</textarea></label></div>`;
  const update = () => {
    data.content = { siteTitle: document.querySelector("#siteTitle").value, heroEyebrow: document.querySelector("#heroEyebrow").value, heroTitle: document.querySelector("#heroTitle").value, heroText: document.querySelector("#heroText").value, footerNote: document.querySelector("#footerNote").value };
    data.announcement = { enabled: document.querySelector("#annEnabled").checked, text: document.querySelector("#annText").value };
    data.settings = { ...data.settings, discord: document.querySelector("#discord").value, sythe: document.querySelector("#sythe").value, googleSheetIds: document.querySelector("#sheetIds").value.split(/\n|,/).map((value) => value.trim()).filter(Boolean), googleSheetTabs: document.querySelector("#sheetTabs").value.split(/\n|,/).map((value) => value.trim()).filter(Boolean) };
  };
  panel.querySelectorAll("input,textarea").forEach((field) => (field.oninput = update));
}

function renderExport() {
  panel.innerHTML = `<div class="toolbar"><div><span class="eyebrow">Safety net</span><h1>Backup & sync</h1><p class="muted">Download a complete snapshot before a major change, or restore one you trust.</p></div><button class="action" id="syncSheet">Sync Google Sheets now</button></div><div class="split-panels"><article class="surface"><h2>Pricing sync</h2><p class="muted">${esc(data.settings?.sheetSyncMessage || "No sync has run yet.")}</p><dl class="meta-list"><div><dt>Status</dt><dd>${esc(data.settings?.sheetSyncStatus || "never")}</dd></div><div><dt>Last sync</dt><dd>${dateText(data.settings?.lastSheetSync)}</dd></div></dl></article><article class="surface"><h2>Backup</h2><p class="muted">Your last saved data is also backed up automatically.</p><button class="secondary" id="download">Download full backup</button><label class="upload-field">Restore a JSON backup<input id="restore" type="file" accept="application/json"></label></article></div><article class="surface activity-surface"><div class="surface-head"><h2>Activity log</h2><span class="pill">${data.activity.length} entries</span></div>${renderActivity(30)}</article>`;
  document.querySelector("#download").onclick = async () => { const response = await api("/api/admin/backup"); const blob = await response.blob(); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "salesman-v5-backup.json"; link.click(); URL.revokeObjectURL(link.href); };
  document.querySelector("#restore").onchange = async (event) => { const file = event.target.files[0]; if (!file) return; const restored = JSON.parse(await file.text()); const response = await api("/api/admin/restore", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(restored) }); if (!response.ok) return alert("Restore failed."); data = await response.json(); render("dashboard"); };
  document.querySelector("#syncSheet").onclick = syncSheet;
}

async function syncSheet() {
  statusEl.textContent = "Syncing sheets…";
  try {
    const response = await api("/api/admin/sync-sheet", { method: "POST" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Sync failed");
    data.settings = payload.settings;
    data.pricing = payload.pricing;
    statusEl.textContent = "Sheet sync complete";
    render(activeTab);
  } catch (error) {
    statusEl.textContent = error.message || "Sync failed";
  }
}

function bindDataInputs() {
  document.querySelectorAll("[data-account][data-key]").forEach((field) => (field.oninput = () => { const item = data.accounts[Number(field.dataset.account)]; item[field.dataset.key] = field.dataset.key === "price" ? Number(field.value) : field.value; }));
  document.querySelectorAll("[data-order][data-key]").forEach((field) => (field.oninput = () => { const item = data.orders[Number(field.dataset.order)]; item[field.dataset.key] = ["amount"].includes(field.dataset.key) ? Number(field.value) : field.value; }));
  document.querySelectorAll("[data-customer][data-key]").forEach((field) => (field.oninput = () => { const item = data.customers[Number(field.dataset.customer)]; item[field.dataset.key] = ["totalOrders", "totalSpent"].includes(field.dataset.key) ? Number(field.value) : field.value; }));
  document.querySelectorAll("[data-worker][data-key]").forEach((field) => (field.oninput = () => { const item = data.workers[Number(field.dataset.worker)]; item[field.dataset.key] = field.type === "checkbox" ? field.checked : field.dataset.key === "rate" ? Number(field.value) : field.value; }));
  document.querySelectorAll("[data-review][data-key]").forEach((field) => (field.oninput = () => { const item = data.reviews[Number(field.dataset.review)]; item[field.dataset.key] = field.type === "checkbox" ? field.checked : field.value; }));
}

document.querySelectorAll(".tab").forEach((button) => (button.onclick = () => render(button.dataset.tab)));
document.querySelector("#save").onclick = async () => {
  statusEl.textContent = "Saving…";
  try {
    const response = await api("/api/admin/data", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Save failed");
    data = payload;
    statusEl.textContent = `Saved ${new Date().toLocaleTimeString()}`;
    render(activeTab);
  } catch (error) {
    statusEl.textContent = error.message || "Save failed";
  }
};

start();
