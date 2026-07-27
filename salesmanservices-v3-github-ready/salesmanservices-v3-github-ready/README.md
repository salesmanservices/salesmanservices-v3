# Salesman Services V4.3 — Live AI Inventory

Cloudflare Worker + Static Assets project based on the working V4.2 admin backend.

## What this update adds

- `/ai-inventory` — server-rendered inventory page for tawk.to AI Assist crawling.
- `/ai-inventory.txt` — crawler-friendly plain-text live inventory.
- `/api/ai-inventory` — structured live JSON for a tawk.to custom API integration.
- Available and sold accounts are separated clearly.
- Explicit AI rules prevent sold-stock and price hallucinations.
- Optional query filters: `status`, `type`, `q`, and `limit`.

## No Cloudflare reconfiguration

This update keeps the existing Worker, domain, KV binding, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, GitHub connection, and all saved KV data. Upload the five root items to the existing GitHub project and commit to `main`.

## tawk.to setup

The simplest supported setup is to add this public website source:

`https://www.salesmanservices.com/ai-inventory`

Then configure tawk.to AI Assist's website re-crawl schedule. For immediate per-conversation data, use the JSON endpoint in a custom API integration:

`https://www.salesmanservices.com/api/ai-inventory?status=available`

See `TAWK_AI_LIVE_INVENTORY_SETUP.txt` for exact instructions and a ready-to-paste AI rule block.
