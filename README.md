# Salesman Services V5

Salesman Services V5 preserves the public V4.3 website and adds the private
operations dashboard at `/admin`.

## Included

- Existing public design, account screenshots, listings and service calculators
- Live public and AI inventory
- Password-protected admin dashboard
- Account, order, customer, worker and review management
- First-party page-view and click analytics
- Activity log, backups and content controls
- Google Sheets pricing sync every six hours
- D1 persistence on ChatGPT Sites
- `SALESMAN_DATA` KV persistence on external Cloudflare Workers

BTC/LTC checkout and automatic payment confirmation are not included in V5.
Those remain planned for V6.

## GitHub and Cloudflare

See `GITHUB_CLOUDFLARE_V5.md` for the complete deployment instructions.

The external Cloudflare configuration is self-building: running
`npx wrangler deploy` executes `npm run build` through `wrangler.jsonc` before
deploying `dist/server/index.js`.

## Local checks

Requires Node.js `>=22.13.0`.

```bash
npm ci
npm run build
npm test
```

After deployment, open `/api/health`. A GitHub/Cloudflare deployment should
report version `5.0` and `kv: true`.
