Salesman Services V6.3 — Encrypted Account Vault & Automatic Delivery

Included:
- Encrypted private credentials per eligible account in /admin
- AES-GCM encryption using a Cloudflare secret
- Automatic delivery email after one confirmed BTC/LTC payment
- Delivery status, errors, and retry button in Orders
- All Skillers are Discord-only, including 99 Woodcutting + 600 Total and 99 Thieving
- Delivery email asks for feedback on Discord, Sythe, or the website and offers 5% off the next order

REQUIRED CLOUDFLARE SECRETS / VARIABLES:
1. VAULT_ENCRYPTION_KEY
   Generate a long random value (32+ characters). Never change it after saving credentials, or existing vault data cannot be decrypted.
2. RESEND_API_KEY
   API key from Resend.
3. DELIVERY_FROM_EMAIL
   A sender on a verified domain, for example: Salesman Services <orders@salesmanservices.com>

Existing variables remain:
ADMIN_PASSWORD, ADMIN_EMAIL, SALESMAN_DATA, BLOCKCYPHER_TOKEN, COINGECKO_API_KEY.

Important:
- A Hotmail address can receive admin/customer replies but normally cannot be used as the automated From address through Resend unless the domain is verified. Configure a domain sender such as orders@salesmanservices.com.
- Never place wallet private keys, seed phrases, or account credentials in GitHub/Cloudflare plain-text variables.
- Add credentials yourself in /admin > Accounts & pictures > Edit listing > Encrypted account vault.
- Website feedback form: /feedback (verified against a paid/completed order; submissions enter Reviews as hidden until approved).
