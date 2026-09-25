# V6.14 Final Deployment Checklist

Use this file in order. Do not skip the Resend domain verification or the end-to-end test.

## A. Before GitHub

- [ ] Use the V6.14 package root as the repository root.
- [ ] Do not add `.env`, `.dev.vars`, API keys, passwords, webhook URLs, or encryption keys.
- [ ] `.gitignore` is already configured to exclude local secret files and build output.
- [ ] `wrangler.jsonc` contains the expected production secret names.
- [ ] Keep the existing `SALESMAN_DATA` KV namespace binding if this is the existing production Worker.

## B. Resend

1. Open the Resend dashboard.
2. Go to **Domains** and add `salesmanservices.com`.
3. Add the DNS records Resend provides at your DNS provider.
4. Wait until the domain is verified.
5. Go to **API Keys** and create a production key.
6. Prefer **Sending Access** and restrict it to the verified sending domain when the Resend UI offers that option.
7. Copy the `re_...` token immediately and store it securely. Do not put it in GitHub or send it in chat.

## C. Cloudflare Production secrets

Open:

**Workers & Pages → holy-tooth-c11a → Settings → Variables and Secrets → Production → Add**

For each item below choose **Secret**:

| Secret name | Value |
|---|---|
| `RESEND_API_KEY` | The new Resend `re_...` token |
| `DELIVERY_FROM_EMAIL` | e.g. `Salesman Services <delivery@salesmanservices.com>` |
| `ADMIN_PASSWORD` | A new strong admin password |
| `DISCORD_ORDER_WEBHOOK` | A new Discord webhook URL |
| `VAULT_ENCRYPTION_KEY` | Your vault encryption key |

Click **Deploy** after the changes.

## D. GitHub

Upload the **contents of this folder**, not the ZIP file itself, to the repository root.

The repository root should contain `package.json`, `wrangler.jsonc`, `worker/`, `app/`, `public/`, `db/`, and the setup documents.

## E. Cloudflare deployment

Use the existing Cloudflare/GitHub connection for the Worker. The configured build command is:

```text
npm run build
```

The Worker entry produced by the build is:

```text
dist/server/index.js
```

Do not delete or recreate the existing `SALESMAN_DATA` binding unless you intentionally want a new empty KV namespace.

## F. End-to-end test

Use a small controlled purchase before announcing automatic delivery as live:

1. Open an account marked for crypto checkout.
2. Enter an email inbox you control.
3. Create the order.
4. Confirm the account is reserved.
5. Send the exact BTC/LTC amount shown by checkout.
6. Watch the order status page.
7. Confirm the blockchain payment reaches the required confirmation.
8. Confirm the account changes to SOLD.
9. Confirm the Resend email arrives.
10. Check the spam/junk folder if needed.
11. In Resend, confirm the email appears in the sending log.
12. In Cloudflare, check Worker logs if anything fails.

## G. If email fails after payment

Do not create a second payment/order immediately.

The paid order is designed to remain paid while delivery is retried. Check:

- `RESEND_API_KEY` exists in **Production** and is a Secret.
- `DELIVERY_FROM_EMAIL` uses the verified Resend domain.
- Resend shows the domain as verified.
- Cloudflare Worker logs for the exact HTTP error from Resend.
- The admin panel's **Retry delivery email** action.

## H. Security

The previous Cloudflare screenshot exposed sensitive production values. Treat those old values as compromised and replace them before production use.

Never paste any new secret into GitHub, Discord, screenshots, or this chat.
