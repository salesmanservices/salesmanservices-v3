import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("keeps V6.13.4 stock, sold-card, checkout, and admin fixes in place", async () => {
  const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
  const [siteHtml, siteJs, siteCss, checkoutCss, adminHtml, adminJs, adminCss] =
    await Promise.all([
      read("../public/site.html"),
      read("../public/assets/site.js"),
      read("../public/assets/site.css"),
      read("../public/assets/checkout.css"),
      read("../public/admin/index.html"),
      read("../public/admin/admin.js"),
      read("../public/admin/admin-v6.13.4.css"),
    ]);

  assert.match(siteHtml, /id="stockCount">7</);
  assert.match(siteJs, /stockCount\.textContent=String\(accounts\.length\)/);
  assert.match(siteCss, /\.sold-account-card:before\{content:none;display:none\}/);
  assert.match(checkoutCss, /\.product\{display:flex;align-items:center;justify-content:space-between;gap:18px\}/);
  assert.match(adminHtml, /admin-v6\.13\.4\.css/);
  assert.match(adminJs, /Salesman Services V6\.13\.4/);
  assert.match(adminJs, /Website live · Pricing fallback/);
  assert.match(adminCss, /\.sync-panel\.needs-attention/);

  const discordSources = `${siteHtml}\n${siteJs}`;
  assert.match(discordSources, /discord\.gg\/xDSvKT3ThQ/);
  assert.match(siteJs, /document\.querySelectorAll\('a\[href\*="discord\.gg"\]'\)/);
});
