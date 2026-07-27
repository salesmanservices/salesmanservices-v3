# Salesman Services V3

Cloudflare Worker + Static Assets project.

## Before first deployment

1. In Cloudflare, open Workers KV > SALESMAN_DATA > Settings and copy the Namespace ID.
2. In `wrangler.jsonc`, replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with that ID.
3. In Cloudflare Worker settings, add an `ADMIN_EMAIL` variable with the email allowed to use `/admin`.
4. Protect `/admin*` and `/api/admin/*` with Cloudflare Access.

## Cloudflare Git build settings

- Production branch: `main`
- Build command: leave blank
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

## Health check

After deployment, open `/api/health`.

