/**
 * Security, Sanitization, & Client Session Utilities
 * Protects frontend against Stored XSS via pseudo-protocols, unsafe markdown HTML,
 * unsafe image/texture sources, open redirects, and stale JWT UI exposure.
 */

const SAFE_WEB_PROTOCOLS = new Set(["http:", "https:"]);
const SAFE_ALL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_RASTER_DATA_RE = /^data:image\/(png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=]+$/i;
const DISALLOWED_MD_ELEMENTS = ["script", "iframe", "object", "embed", "form", "style", "meta", "link"];

/**
 * Validates whether a given URL is safe to render in an <a href> attribute.
 *
 * @param {string} url - Candidate URL
 * @param {object} options
 * @param {boolean} options.allowMailTel - Allow mailto: and tel: schemes (default: true)
 * @param {boolean} options.allowRelative - Allow relative routes starting with / or # (default: true)
 * @returns {boolean}
 */
export function isSafeUrl(url, { allowMailTel = true, allowRelative = true } = {}) {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  // Allow internal relative paths and hashes
  if (allowRelative && (trimmed.startsWith("#") || (trimmed.startsWith("/") && !trimmed.startsWith("//")))) {
    return true;
  }

  // Reject dangerous pseudo-protocols explicitly before parser
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:")
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    const allowed = allowMailTel ? SAFE_ALL_PROTOCOLS : SAFE_WEB_PROTOCOLS;
    return allowed.has(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Returns a sanitized URL for href attributes, or fallback if unsafe.
 *
 * @param {string} url - Raw URL from DB or props
 * @param {string} fallback - Safe fallback (default: "#")
 * @param {object} options - Options passed to isSafeUrl
 * @returns {string}
 */
export function sanitizeHref(url, fallback = "#", options = {}) {
  return isSafeUrl(url, options) ? url.trim() : fallback;
}

/**
 * Validates and returns a safe image/texture URL for <img src> or WebGL TextureLoader.
 * Allows http:, https:, blob:, relative paths, and safe raster data: URIs (explicitly excludes data:image/svg+xml).
 *
 * @param {string} url
 * @param {string} fallback
 * @returns {string}
 */
export function sanitizeImageUrl(url, fallback = "") {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  if (SAFE_RASTER_DATA_RE.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:" || parsed.protocol === "blob:") {
      return trimmed;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

/**
 * Hardened previewOptions for @uiw/react-md-editor:
 * Strips rehypeRaw (disabling raw inline HTML parsing), blocks dangerous tags,
 * and sanitizes markdown link/image URLs.
 */
export const SAFE_MD_PREVIEW_OPTIONS = {
  disallowedElements: DISALLOWED_MD_ELEMENTS,
  urlTransform: (url) => sanitizeHref(url, ""),
  pluginsFilter: (type, plugins) =>
    type === "rehype"
      ? plugins.filter((p) => {
          const fn = Array.isArray(p) ? p[0] : p;
          return fn?.name !== "rehypeRaw";
        })
      : plugins,
};

/**
 * Performs structural & expiration validation of a client-stored JWT cookie.
 * Note: Cryptographic signature verification always happens server-side in admin.guard.js;
 * this prevents rendering the /mod UI shell for missing, malformed, or expired tokens.
 */
export function isTokenStructurallyValid(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    if (payload?.role !== "admin") return false;
    if (typeof payload?.exp !== "number" || payload.exp * 1000 <= Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Restricts post-login redirects strictly to internal /mod paths to prevent open redirects.
 */
export function getSafeModRedirect(pathname, fallback = "/mod/dashboard") {
  if (typeof pathname !== "string") return fallback;
  const trimmed = pathname.trim();
  if (
    (trimmed === "/mod" || trimmed.startsWith("/mod/")) &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("\\")
  ) {
    return trimmed;
  }
  return fallback;
}
