import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { after, before, describe, test } from "node:test";

process.env.NODE_ENV = "test";
const { createApp, normalizeOrigin } = await import("../app.js");

// A stand-in for the built website (dist/): index.html and one hashed asset.
const dist = fs.mkdtempSync(path.join(os.tmpdir(), "vidyaadaan-dist-"));
fs.mkdirSync(path.join(dist, "assets"));
fs.writeFileSync(path.join(dist, "index.html"), "<!doctype html><title>VIDYADAAN</title><div id=root></div>");
fs.writeFileSync(path.join(dist, "assets", "index-Ab12Cd34.js"), "console.log('app')");
fs.writeFileSync(path.join(dist, "favicon.svg"), "<svg xmlns='http://www.w3.org/2000/svg'/>");

const listen = (app) => new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
let site;
let apiOnly;
const url = (server, p) => `http://127.0.0.1:${server.address().port}${p}`;

before(async () => {
    site = await listen(createApp({ corsOrigin: "https://vidyadaan.example", rateLimits: false, clientDir: dist }));
    apiOnly = await listen(createApp({ corsOrigin: "http://localhost:5173", rateLimits: false }));
});
after(async () => {
    await Promise.all([site, apiOnly].map((s) => new Promise((r) => s.close(r))));
    fs.rmSync(dist, { recursive: true, force: true });
});

describe("the server also serves the website (production)", () => {
    test("every page address returns the React app, never cached, so a new deploy shows on the next visit", async () => {
        for (const p of ["/", "/projects/0123456789abcdef01234567", "/dashboard/school/profile", "/login/donor", "/terms"]) {
            const res = await fetch(url(site, p));
            assert.equal(res.status, 200, p);
            assert.match(res.headers.get("content-type"), /text\/html/, p);
            assert.equal(res.headers.get("cache-control"), "no-cache", p);
            assert.match(await res.text(), /<div id=root>/, p);
        }
    });

    test("built files are served and may be cached; a missing one is a plain 404, not the page", async () => {
        const asset = await fetch(url(site, "/assets/index-Ab12Cd34.js"));
        assert.equal(asset.status, 200);
        assert.match(asset.headers.get("cache-control"), /max-age=31536000.*immutable/);
        assert.equal(await asset.text(), "console.log('app')");
        assert.equal((await fetch(url(site, "/favicon.svg"))).status, 200);
        const missing = await fetch(url(site, "/assets/old-build-Zz99.js"));
        assert.equal(missing.status, 404);
        assert.equal(await missing.text(), "");
    });

    test("the API is unchanged: JSON answers and JSON 404s, never the web page", async () => {
        const ok = await fetch(url(site, "/api/test"));
        assert.deepEqual(await ok.json(), { message: "Vidyaadaan API is working" });
        for (const p of ["/api/does-not-exist", "/api", "/api/"]) {
            const res = await fetch(url(site, p));
            assert.equal(res.status, 404, p);
            assert.deepEqual(await res.json(), { message: "API route not found." }, p);
        }
    });

    test("security headers allow exactly the outside services the site uses", async () => {
        const res = await fetch(url(site, "/"));
        const csp = res.headers.get("content-security-policy");
        for (const needed of [
            "default-src 'self'",
            "script-src 'self' https://*.razorpay.com https://accounts.google.com/gsi/client",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style",
            "font-src 'self' data: https://fonts.gstatic.com",
            "frame-src https://*.razorpay.com https://accounts.google.com/gsi/ https://maps.google.com https://www.google.com",
            "object-src 'none'",
            "frame-ancestors 'self'",
        ]) {
            assert.ok(csp.includes(needed), `missing: ${needed}\n${csp}`);
        }
        assert.ok(!csp.includes("upgrade-insecure-requests"));
        assert.ok(!/script-src[^;]*'unsafe-(inline|eval)'/.test(csp), "no inline or eval scripts");
        assert.equal(res.headers.get("cross-origin-opener-policy"), "same-origin-allow-popups");
        assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
        assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    });

    test("without a built website (development), the server is the API only", async () => {
        assert.equal((await fetch(url(apiOnly, "/"))).status, 404);
        assert.equal((await fetch(url(apiOnly, "/projects/abc"))).status, 404);
        assert.equal((await fetch(url(apiOnly, "/api/test"))).status, 200);
    });
});

describe("FRONTEND_ORIGIN, as typed into a hosting dashboard", () => {
    test("stray spaces, a line break from copying, a final / and capitals are cleaned up", () => {
        for (const typed of ["https://vidyadaan.onrender.com", " https://vidyadaan.onrender.com\n", "https://vidyadaan.onrender.com/", "\thttps://Vidyadaan.onRender.com/\r\n"]) {
            assert.equal(normalizeOrigin(typed), "https://vidyadaan.onrender.com", JSON.stringify(typed));
        }
        assert.equal(normalizeOrigin("http://localhost:5173"), "http://localhost:5173");
    });

    test("anything that isn't just the website's address stops the server with a clear message", () => {
        for (const typed of [
            "vidyadaan.onrender.com",
            "“https://vidyadaan.onrender.com”",
            "\"https://vidyadaan.onrender.com\"",
            "https://vidyadaan.onrender.com/dashboard",
            "https://vidyadaan.onrender.com?x=1",
            "https://vidyadaan.onrender.com​",
            "https://vidyadaan.onrender.com https://other.example",
            "ftp://vidyadaan.onrender.com",
            "",
        ]) {
            assert.throws(() => normalizeOrigin(typed), /FRONTEND_ORIGIN must be only the website's address/, JSON.stringify(typed));
            assert.throws(() => createApp({ corsOrigin: typed, rateLimits: false }), /FRONTEND_ORIGIN/, `createApp ${JSON.stringify(typed)}`);
        }
    });

    test("an address copied with a line break still serves every request (the failed deploy)", async () => {
        const server = await listen(createApp({ corsOrigin: "https://vidyadaan.onrender.com\n", rateLimits: false, clientDir: dist }));
        try {
            const health = await fetch(url(server, "/api/test"));
            assert.equal(health.status, 200);
            assert.equal(health.headers.get("access-control-allow-origin"), "https://vidyadaan.onrender.com");
            assert.equal((await fetch(url(server, "/"))).status, 200);
        } finally {
            await new Promise((r) => server.close(r));
        }
    });
});
