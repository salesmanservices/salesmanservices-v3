const loginScreen = document.querySelector('#loginScreen');
const adminApp = document.querySelector('#adminApp');
const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const passwordInput = document.querySelector('#password');
const panel = document.querySelector('#panel');
const statusEl = document.querySelector('#status');
const SESSION_KEY = 'salesman_admin_token';

let data = { accounts: [], reviews: [], announcement: { enabled: false, text: '' }, settings: {} };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

function authHeaders(extra = {}) {
  const token = localStorage.getItem(SESSION_KEY);
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function api(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: authHeaders(options.headers || {}),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function load() {
  try {
    const r = await api('/api/admin/data');
    const out = await r.json();
    if (!r.ok) throw new Error(out.error || 'Access denied');
    data = out;
    data.accounts ||= [];
    data.reviews ||= [];
    render('dashboard');
    statusEl.textContent = 'Connected';
  } catch (e) {
    panel.innerHTML = `<div class="notice"><b>Could not load admin data.</b><p>${esc(e.message)}</p></div>`;
    statusEl.textContent = 'Connection error';
  }
}

async function start() {
  try {
    const r = await api('/api/admin/session');
    const session = await r.json();
    if (!session.configured) {
      loginScreen.hidden = false;
      adminApp.hidden = true;
      loginError.textContent = 'ADMIN_PASSWORD is not configured in Cloudflare yet.';
      return;
    }
    if (!session.authenticated) {
      localStorage.removeItem(SESSION_KEY);
      loginScreen.hidden = false;
      adminApp.hidden = true;
      return;
    }
    loginError.textContent = '';
    loginScreen.hidden = true;
    adminApp.hidden = false;
    await load();
  } catch (e) {
    loginScreen.hidden = false;
    adminApp.hidden = true;
    loginError.textContent = e.name === 'AbortError' ? 'Login check timed out. Refresh and try again.' : `Connection error: ${e.message}`;
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = loginForm.querySelector('button[type="submit"]');
  button.disabled = true;
  loginError.textContent = 'Logging in…';
  try {
    const r = await api('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: passwordInput.value })
    });
    const out = await r.json();
    if (!r.ok) throw new Error(out.error || 'Login failed');
    if (out.token) localStorage.setItem(SESSION_KEY, out.token);
    passwordInput.value = '';
    loginError.textContent = '';
    await start();
  } catch (e) {
    loginError.textContent = e.name === 'AbortError' ? 'Login request timed out. Please try again.' : e.message;
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#logout').addEventListener('click', async () => {
  try { await api('/api/admin/logout', { method: 'POST' }); } catch {}
  localStorage.removeItem(SESSION_KEY);
  location.reload();
});

function render(tab) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'dashboard') {
    panel.innerHTML = `<div class="toolbar"><div><h1>Overview</h1><p class="muted">Manage the live website without changing its design.</p></div></div><div class="cards"><div class="card">Available accounts<b>${data.accounts.filter((a) => a.status !== 'sold').length}</b></div><div class="card">Recently sold<b>${data.accounts.filter((a) => a.status === 'sold').length}</b></div><div class="card">Reviews<b>${data.reviews.length}</b></div><div class="card">Languages<b>3</b></div></div>`;
  }
  if (tab === 'accounts') renderAccounts();
  if (tab === 'reviews') renderReviews();
  if (tab === 'content') renderContent();
  if (tab === 'export') renderExport();
}

function renderAccounts() {
  panel.innerHTML = `<div class="toolbar"><div><h1>Accounts</h1><p class="muted">Add, edit, remove or mark accounts sold.</p></div><button class="action" id="addAccount">+ Add account</button></div><div class="list">${data.accounts.map((a, i) => `<div class="row"><img src="/${esc(a.image)}"><div class="account-title" data-edit-account="${i}"><b>${esc(a.title)}</b><div class="muted">${esc(a.type)}</div></div><input data-i="${i}" data-k="price" type="number" value="${esc(a.price)}"><select data-i="${i}" data-k="status"><option value="available" ${a.status !== 'sold' ? 'selected' : ''}>Available</option><option value="sold" ${a.status === 'sold' ? 'selected' : ''}>Sold</option></select><button class="action danger" data-delete="${i}">Delete</button></div>`).join('')}</div>`;
  document.querySelector('#addAccount').onclick = () => {
    data.accounts.unshift({ id: `account-${Date.now()}`, type: 'Account', title: 'New OSRS Account', price: 0, image: 'assets/accounts/zerker-1.png', tags: ['Negotiable'], description: 'Edit this description.', buy: data.settings.discord || 'https://discord.gg/HkUCNNQtmG', button: 'Reserve on Discord', status: 'available' });
    renderAccounts();
  };
  bindInputs();
  document.querySelectorAll('[data-delete]').forEach((b) => b.onclick = () => { if (confirm('Delete this account?')) { data.accounts.splice(+b.dataset.delete, 1); renderAccounts(); } });
  document.querySelectorAll('[data-edit-account]').forEach((el) => el.onclick = () => editAccount(+el.dataset.editAccount));
}

function editAccount(i) {
  const a = data.accounts[i];
  const fields = ['title', 'type', 'price', 'image', 'secondImage', 'description', 'buy', 'button', 'soldDate'];
  panel.innerHTML = `<div class="toolbar"><h1>Edit account</h1><button class="action" id="back">← Back</button></div><div class="editor grid2">${fields.map((k) => k === 'description' ? `<label>${k}<textarea data-edit="${k}">${esc(a[k] || '')}</textarea></label>` : `<label>${k}<input data-edit="${k}" ${k === 'price' ? 'type="number"' : ''} value="${esc(a[k] ?? '')}"></label>`).join('')}<label>Tags (comma separated)<input id="tags" value="${esc((a.tags || []).join(', '))}"></label><label>Status<select id="editStatus"><option value="available">Available</option><option value="sold">Sold</option></select></label></div>`;
  document.querySelector('#editStatus').value = a.status || 'available';
  document.querySelector('#back').onclick = () => {
    document.querySelectorAll('[data-edit]').forEach((x) => a[x.dataset.edit] = x.dataset.edit === 'price' ? Number(x.value) : x.value);
    a.tags = document.querySelector('#tags').value.split(',').map((x) => x.trim()).filter(Boolean);
    a.status = document.querySelector('#editStatus').value;
    renderAccounts();
  };
}

function renderReviews() {
  panel.innerHTML = `<div class="toolbar"><div><h1>Reviews</h1></div><button class="action" id="addReview">+ Add review</button></div><div class="list">${data.reviews.map((r, i) => `<div class="editor"><label>Name<input data-r="${i}" data-k="name" value="${esc(r.name)}"></label><label>Source<input data-r="${i}" data-k="source" value="${esc(r.source)}"></label><label>Feedback<textarea data-r="${i}" data-k="text">${esc(r.text)}</textarea></label><button class="action danger" data-rdelete="${i}">Delete</button></div>`).join('')}</div>`;
  document.querySelector('#addReview').onclick = () => { data.reviews.unshift({ name: 'Customer', source: 'Discord', text: 'Great service.' }); renderReviews(); };
  document.querySelectorAll('[data-r]').forEach((x) => x.oninput = () => data.reviews[+x.dataset.r][x.dataset.k] = x.value);
  document.querySelectorAll('[data-rdelete]').forEach((x) => x.onclick = () => { data.reviews.splice(+x.dataset.rdelete, 1); renderReviews(); });
}

function renderContent() {
  panel.innerHTML = `<h1>Content & links</h1><div class="editor"><label><input id="annEnabled" type="checkbox" ${data.announcement?.enabled ? 'checked' : ''}> Enable website announcement</label><label>Announcement<textarea id="annText">${esc(data.announcement?.text || '')}</textarea></label><label>Discord link<input id="discord" value="${esc(data.settings?.discord || '')}"></label><label>SellApp link<input id="sellapp" value="${esc(data.settings?.sellapp || '')}"></label></div>`;
  ['annEnabled', 'annText', 'discord', 'sellapp'].forEach((id) => document.querySelector(`#${id}`).oninput = () => {
    data.announcement = { enabled: document.querySelector('#annEnabled').checked, text: document.querySelector('#annText').value };
    data.settings = { ...data.settings, discord: document.querySelector('#discord').value, sellapp: document.querySelector('#sellapp').value };
  });
}

function renderExport() {
  panel.innerHTML = `<h1>Backup & export</h1><div class="editor"><p>Download a full JSON backup before major updates.</p><button class="action" id="download">Download backup</button><label style="margin-top:20px">Restore backup<input id="restore" type="file" accept="application/json"></label></div>`;
  document.querySelector('#download').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'salesman-site-backup.json'; a.click(); };
  document.querySelector('#restore').onchange = async (e) => { data = JSON.parse(await e.target.files[0].text()); render('dashboard'); };
}

function bindInputs() {
  document.querySelectorAll('[data-i][data-k]').forEach((x) => x.oninput = () => data.accounts[+x.dataset.i][x.dataset.k] = x.dataset.k === 'price' ? Number(x.value) : x.value);
}

document.querySelectorAll('.tab').forEach((b) => b.onclick = () => render(b.dataset.tab));
document.querySelector('#save').onclick = async () => {
  statusEl.textContent = 'Saving…';
  try {
    const r = await api('/api/admin/data', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    const out = await r.json();
    statusEl.textContent = r.ok ? `Saved ${new Date().toLocaleTimeString()}` : (out.error || 'Save failed');
  } catch (e) { statusEl.textContent = e.message || 'Save failed'; }
};

start();
