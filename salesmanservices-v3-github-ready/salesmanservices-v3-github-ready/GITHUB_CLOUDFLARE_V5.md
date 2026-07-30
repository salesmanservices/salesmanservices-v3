# Salesman Services V5 — GitHub + Cloudflare package

This archive is the V5 source at the current working checkpoint. It keeps the
public site, account screenshots, calculators, services, links and `/admin`
surface together in one repository-root package.

V5 includes:

- Public Salesman Services website with the existing visual design and assets
- Live inventory and AI inventory endpoints
- Password-protected `/admin`
- Account/status/picture controls, orders, customers, workers, analytics,
  reviews, content controls, backups and Google Sheets pricing sync
- Existing `SALESMAN_DATA` KV persistence for GitHub/Cloudflare deployments
- A six-hour scheduled pricing sync

V6 crypto checkout and automatic payment confirmation are intentionally not in
this package.

## Put it in GitHub

1. Extract this ZIP.
2. Upload the contents of the extracted folder to the **repository root**.
   `package.json`, `wrangler.jsonc`, `public/`, `app/` and `worker/` must be
   visible at the root level. Do not upload the ZIP as a nested folder.
3. Commit to the `main` branch.

The archive intentionally omits `node_modules/`, `dist/`, `.wrangler/` and
`.git/`; Cloudflare rebuilds those from the lockfile.

## Connect Cloudflare Workers

Use a **Workers** GitHub deployment, not a static Pages-only deployment:

- Root directory: `/`
- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The included `wrangler.jsonc` points Cloudflare to the generated
`dist/server/index.js` Worker and `dist/client` static assets. It also keeps the
existing `SALESMAN_DATA` KV namespace from the previous V4/V5 setup. Verify that
the namespace ID in `wrangler.jsonc` is still present in your Cloudflare
account before the first deploy; if it was replaced, update only that ID.

## Add the admin secrets

From the extracted repository root, after logging in with Wrangler:

```bash
npm ci
npm run build
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_EMAIL
npx wrangler deploy
```

`ADMIN_EMAIL` is optional and is used as the admin activity-log name. Never put
the admin password in GitHub, `wrangler.jsonc`, or this ZIP.

## Verify after deploy

Open these paths on the deployed Worker:

- `/` — public website
- `/admin` — admin login
- `/api/health` — should return `version: "5.0"` and show `kv: true`
- `/api/site-data` — public inventory data
- `/api/ai-inventory` — live AI inventory JSON
- `/api/pricing` — calculator pricing data

Log in at `/admin`, save one harmless change, download a backup, and use
“Sync now” under Backup & sync. Prices are imported from the configured Google
Sheets tabs; if a sheet is unavailable, the last working prices remain in place.

## Optional image uploads

The existing account screenshots are bundled in `public/assets/accounts/` and
remain available without any extra service. New image uploads in `/admin` need
an R2 bucket bound as `BUCKET`; without it, the upload control reports that
image storage is not configured. This does not affect the bundled account
pictures or the rest of V5.

## Custom domain

The package does not change the existing custom-domain configuration. Attach
`salesmanservices.com` in Cloudflare when you are ready, then update the
canonical URL/sitemap if the hostname differs from the current files.
