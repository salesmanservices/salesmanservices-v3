Salesman Services V6.2 — Automatic Crypto Detection

New:
- Live BTC/LTC conversion at order creation
- Unique USD-cent invoice amount per pending order
- Exact 8-decimal BTC/LTC amount
- Automatic blockchain checks every 2 minutes and when buyer status refreshes
- One confirmation marks order paid and account sold
- Transaction hash and confirmations stored in Orders

Recommended Cloudflare secrets (optional but strongly recommended for API reliability):
- BLOCKCYPHER_TOKEN = your BlockCypher API token
- COINGECKO_API_KEY = your CoinGecko Demo API key

Existing settings remain unchanged. No private keys or wallet seed phrases are needed.
Automatic credential email delivery is NOT included yet; that is V6.3.
