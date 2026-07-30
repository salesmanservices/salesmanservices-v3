SALESMAN SERVICES V6.5 — ORDER STATUS, DISCORD ALERTS & SEO

Included:
- Removed public SellApp references and checkout links.
- Crypto listings use the Salesman Services BTC/LTC checkout.
- Checkout clearly explains automatic email delivery and what the buyer receives.
- Secure live order-status page at /order using an order-specific private token.
- Discord admin webhook alerts for new checkout, detected payment, confirmed payment, successful delivery, and delivery failure.
- SEO title, description, canonical URL, Open Graph metadata, Organization structured data, robots.txt and sitemap improvements.
- Existing admin, KV inventory, encrypted vault, payment detection, sale methods and public design are preserved.

CLOUDFLARE SECRET REQUIRED:
DISCORD_ORDER_WEBHOOK

Security: never place the webhook in GitHub or in this ZIP. Add it as a Cloudflare secret.
Because a prior webhook URL was shared in chat, delete/rotate that Discord webhook and use a newly generated webhook URL.

Existing Cloudflare settings remain:
Root directory: /
Build command: empty
Deploy command: npx wrangler deploy
