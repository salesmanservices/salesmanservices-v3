# Resend + Cloudflare quick setup

## 1. Resend: create the API key

In Resend:

**Dashboard → API Keys → Create API Key**

Create a production key for this website. Prefer a **Sending Access** key and, if available, restrict it to the verified `salesmanservices.com` sending domain.

The token looks like:

```text
re_................................
```

**That `re_...` value is the `RESEND_API_KEY`.** It is shown when the key is created; save it securely and do not send it to anyone.

## 2. Resend: choose the From email

In Resend:

**Dashboard → Domains → Add Domain**

Add and verify:

```text
salesmanservices.com
```

Resend will show DNS records to add. Complete verification first.

After verification, you choose an address on that domain. For example:

```text
Salesman Services <delivery@salesmanservices.com>
```

There is **no second secret code** for `DELIVERY_FROM_EMAIL`.

`DELIVERY_FROM_EMAIL` is simply the sender address/name that your Worker sends from. It must use a domain Resend has verified for sending.

## 3. Cloudflare: add both values

Open:

**Workers & Pages → holy-tooth-c11a → Settings → Variables and Secrets → Production → Add**

For `RESEND_API_KEY`:

- Type: **Secret**
- Name: `RESEND_API_KEY`
- Value: paste your Resend `re_...` token

For `DELIVERY_FROM_EMAIL`:

- Type: **Secret**
- Name: `DELIVERY_FROM_EMAIL`
- Value: `Salesman Services <delivery@salesmanservices.com>`

Then click **Deploy**.

Cloudflare documents that Worker secrets are encrypted and hidden after they are saved, and that required secrets declared in `wrangler.jsonc` are validated during deploy.

## Never do this

Do not put the real values into:

- GitHub
- `.dev.vars.example`
- `wrangler.jsonc`
- public JavaScript
- screenshots
- Discord messages
- this chat

The repository only contains placeholders.
