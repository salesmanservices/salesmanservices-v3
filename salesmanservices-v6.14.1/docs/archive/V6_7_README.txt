Salesman Services V6.7 - Crypto Price Reliability Fix

Fixes checkout order creation when CoinGecko is unavailable or rate-limited.

Price lookup order:
1. Coinbase Exchange public BTC-USD / LTC-USD ticker
2. CoinGecko Demo API fallback
3. Last successful cached rate for up to 24 hours

Cloudflare variables remain unchanged. COINGECKO_API_KEY is optional but recommended.
