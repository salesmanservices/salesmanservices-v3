# Salesman Services V4 — Password Admin

This version replaces Cloudflare Access with a built-in secure password login.

## Deploy

Upload/commit these root items to the existing GitHub repository:

- `public/`
- `src/`
- `package.json`
- `README.md`
- `wrangler.jsonc`

Cloudflare deploys automatically from `main` with `npx wrangler deploy`.

## One required Cloudflare setting

Open **Workers & Pages → holy-tooth-c11a → Settings → Variables and Secrets**.

Add a **Secret** (not plain text):

- Name: `ADMIN_PASSWORD`
- Value: your private admin password

Deploy/save the secret. No Cloudflare Zero Trust or Access application is required.

## Test

1. Open `/api/health` — it should show `version: 4`, `auth: "password"`, and `adminConfigured: true`.
2. Open `/admin` — enter your password.
3. Make a small change and click **Save changes**.

## Security included

- Secure HttpOnly session cookie
- 12-hour sessions
- SameSite=Strict
- Origin checks for write requests
- Rate limiting after repeated failed logins
- Automatic KV backup before every save and restore
