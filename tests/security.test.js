import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  isSafeUrl,
  sanitizeHref,
  sanitizeImageUrl,
  SAFE_MD_PREVIEW_OPTIONS,
  isTokenStructurallyValid,
  getSafeModRedirect,
} from "../src/utils/security.js";
import { injectSeoToHtml } from "../seo-routes.js";

const rootDir = path.resolve(import.meta.dirname, "..");

describe("Frontend Security & Perimeter Suite", () => {
  describe("1. Dynamic Link & Image XSS Sanitization", () => {
    it("blocks javascript:, vbscript:, data:, tab-obfuscated schemes, and protocol-relative // links", () => {
      const dangerousUrls = [
        "javascript:alert(1)",
        "JaVaScRiPt:alert(document.cookie)",
        "java\tscript:alert(1)",
        "java\nscript:alert(1)",
        "vbscript:msgbox(1)",
        "data:text/html,<script>alert(1)</script>",
        "//evil.com/phish",
        "",
        null,
        undefined,
      ];

      for (const url of dangerousUrls) {
        assert.equal(isSafeUrl(url), false, `isSafeUrl must reject: ${String(url)}`);
        assert.equal(sanitizeHref(url), "#", `sanitizeHref must fall back to # for: ${String(url)}`);
      }
    });

    it("allows safe http:, https:, mailto:, tel:, and relative route/anchor URLs", () => {
      const safeUrls = [
        "https://github.com/dcr",
        "http://localhost:5173/projects",
        "mailto:denny@example.com",
        "tel:+15551234567",
        "/projects",
        "#featured",
      ];

      for (const url of safeUrls) {
        assert.equal(isSafeUrl(url), true, `isSafeUrl must allow: ${url}`);
        assert.equal(sanitizeHref(url), url);
      }
    });

    it("rejects SVG data URIs and non-image schemes in sanitizeImageUrl while keeping safe raster/HTTPS images", () => {
      assert.equal(sanitizeImageUrl("data:image/svg+xml;base64,PHN2Zz48c2NyaXB0Lz48L3N2Zz4="), "");
      assert.equal(sanitizeImageUrl("javascript:alert(1)"), "");
      assert.equal(sanitizeImageUrl("//evil.com/img.png"), "");
      assert.equal(
        sanitizeImageUrl("https://res.cloudinary.com/dcr/image/upload/v1/demo.webp"),
        "https://res.cloudinary.com/dcr/image/upload/v1/demo.webp"
      );
      assert.equal(
        sanitizeImageUrl("data:image/png;base64,iVBORw0KGgo="),
        "data:image/png;base64,iVBORw0KGgo="
      );
      assert.equal(sanitizeImageUrl("blob:https://example.com/1234"), "blob:https://example.com/1234");
      assert.equal(sanitizeImageUrl("/assets/placeholder.svg"), "/assets/placeholder.svg");
    });
  });

  describe("2. Markdown Editor Preview Hardening", () => {
    it("strips rehypeRaw, blocks dangerous HTML elements, and sanitizes markdown URLs", () => {
      assert.equal(SAFE_MD_PREVIEW_OPTIONS.urlTransform("javascript:alert(1)"), "");
      assert.equal(SAFE_MD_PREVIEW_OPTIONS.urlTransform("https://example.com"), "https://example.com");
      assert.ok(SAFE_MD_PREVIEW_OPTIONS.disallowedElements.includes("script"));
      assert.ok(SAFE_MD_PREVIEW_OPTIONS.disallowedElements.includes("iframe"));

      function rehypeRaw() {}
      function rehypeSlug() {}
      const filtered = SAFE_MD_PREVIEW_OPTIONS.pluginsFilter("rehype", [rehypeRaw, [rehypeRaw, {}], rehypeSlug]);
      assert.deepEqual(filtered, [rehypeSlug]);
    });
  });

  describe("3. Client Auth Shell & Open-Redirect Guards", () => {
    it("rejects malformed, non-admin, and expired JWT strings in ProtectedRoute validator", () => {
      assert.equal(isTokenStructurallyValid(undefined), false);
      assert.equal(isTokenStructurallyValid("fake-cookie-string"), false);

      const nonAdmin = Buffer.from(
        JSON.stringify({ role: "guest", exp: Math.floor(Date.now() / 1000) + 600 })
      ).toString("base64url");
      assert.equal(isTokenStructurallyValid(`h.${nonAdmin}.s`), false);

      const expired = Buffer.from(
        JSON.stringify({ role: "admin", exp: Math.floor(Date.now() / 1000) - 60 })
      ).toString("base64url");
      assert.equal(isTokenStructurallyValid(`h.${expired}.s`), false);

      const valid = Buffer.from(
        JSON.stringify({ role: "admin", exp: Math.floor(Date.now() / 1000) + 600 })
      ).toString("base64url");
      assert.equal(isTokenStructurallyValid(`h.${valid}.s`), true);
    });

    it("restricts post-login redirects strictly to internal /mod routes", () => {
      assert.equal(getSafeModRedirect("/mod/projects/123"), "/mod/projects/123");
      assert.equal(getSafeModRedirect("/mod"), "/mod");
      assert.equal(getSafeModRedirect("https://evil.com"), "/mod/dashboard");
      assert.equal(getSafeModRedirect("//evil.com"), "/mod/dashboard");
      assert.equal(getSafeModRedirect("/\\evil.com"), "/mod/dashboard");
      assert.equal(getSafeModRedirect("/projects"), "/mod/dashboard");
    });
  });

  describe("4. SSR Prerender Host Safety & Production CSP Configuration", () => {
    it("escapes injected HTML/attribute payloads in injectSeoToHtml origin", () => {
      const template =
        '<head><title>x</title><meta name="description" content="d"><meta property="og:url" content="u"></head><body><div id="root"></div></body>';
      const output = injectSeoToHtml(template, "/", 'https://evil.com"><script>alert(1)</script>');
      assert.equal(output.includes("<script>alert(1)</script>"), false);
      assert.ok(output.includes("&quot;&gt;&lt;script&gt;"));
    });

    it("enforces strict CSP and security headers in vercel.json without unsafe script allowances", () => {
      const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, "vercel.json"), "utf8"));
      const headers = Object.fromEntries(
        vercelConfig.headers[0].headers.map((h) => [h.key.toLowerCase(), h.value])
      );

      assert.ok(headers["strict-transport-security"]?.includes("max-age="));
      assert.equal(headers["x-content-type-options"], "nosniff");
      assert.equal(headers["x-frame-options"], "SAMEORIGIN");
      assert.ok(headers["permissions-policy"]?.includes("camera=()"));

      const csp = headers["content-security-policy"] || "";
      assert.ok(csp.includes("script-src 'self';"), "Production CSP must strictly lock script-src to 'self'");
      assert.equal(csp.includes("'unsafe-eval'"), false);
      assert.ok(csp.includes("object-src 'none'"));
      assert.ok(csp.includes("frame-ancestors 'self'"));
    });

    it("does not allow arbitrary external https: scripts in vite.config.js dev CSP", () => {
      const viteConfig = fs.readFileSync(path.join(rootDir, "vite.config.js"), "utf8");
      const cspMatch = viteConfig.match(/"Content-Security-Policy":\s*\n?\s*"([^"]+)"/);
      assert.ok(cspMatch, "vite.config.js must define Content-Security-Policy");
      const scriptSrc = cspMatch[1].match(/script-src[^;]+/)?.[0] || "";
      assert.equal(scriptSrc.includes("https:"), false, "Dev script-src must not allow arbitrary https: hosts");
    });

    it("ensures built dist/index.html contains zero inline scripts when dist exists", () => {
      const distIndex = path.join(rootDir, "dist/index.html");
      if (fs.existsSync(distIndex)) {
        const html = fs.readFileSync(distIndex, "utf8");
        const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(
          ([, attrs, body]) => !/\bsrc=/.test(attrs) && body.trim().length > 0
        );
        assert.equal(inlineScripts.length, 0, "dist/index.html must contain zero inline scripts for strict CSP");
      }
    });
  });
});
