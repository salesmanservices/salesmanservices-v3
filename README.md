# Salesman Services V6.15

Production-ready project package for the Salesman Services marketplace.

## Start here

1. **`FINAL_DEPLOY_CHECKLIST.md`** — do this before the first production deploy.
2. **`V6.14_SETUP.md`** — full GitHub + Cloudflare setup.
3. **`RESEND_CLOUDFLARE_QUICKSTART.md`** — exactly where to create and paste the Resend secrets.
4. **`.dev.vars.example`** — placeholder names only; never put real secrets here in a GitHub commit.

## V6.14 includes

- Professional 3-step checkout: Review → Pay → Delivery.
- BTC/LTC payment flow with automatic payment monitoring.
- Automatic account delivery through Resend after confirmed payment.
- Automatic delivery retry for a paid order if the email provider temporarily fails.
- Encrypted account credentials in the private Account Vault.
- Responsive account inventory and compact Sold Accounts grid.
- Mobile-first checkout and account cards.
- Customer order-status timeline and delivery messaging.
- Admin delivery retry control.
- Cloudflare KV persistence and Worker cron checks.
- Required-secret validation in `wrangler.jsonc`.
- Git-safe secret handling: no production API keys, passwords, or webhook URLs are included.

## Production architecture

```text
Customer
  ↓
Salesman Services checkout
  ↓
Cloudflare Worker
  ↓
BTC / LTC payment monitoring
  ↓
Confirmed payment
  ↓
Account marked SOLD
  ↓
Encrypted Account Vault is decrypted server-side
  ↓
Resend API
  ↓
Customer email
```

If Resend temporarily fails after payment confirmation, the order stays paid and the scheduled Worker checks retry delivery. The admin dashboard also has a manual retry action.

## Important

This repository cannot contain your live Cloudflare or Resend secret values. Configure them in **Cloudflare Workers & Pages → your Worker → Settings → Variables and Secrets → Production** and choose **Secret** for sensitive values.

A successful GitHub upload alone does not prove that production email delivery works. After deployment, perform the controlled end-to-end test in `FINAL_DEPLOY_CHECKLIST.md`.

Historical V5/V6 notes are kept under `docs/archive/` for reference and are not deployment instructions.
