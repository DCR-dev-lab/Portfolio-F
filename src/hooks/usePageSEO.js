import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Helper to update or create an HTML <meta> tag.
 */
const updateMeta = (attrName, attrValue, content) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
    }
    element.setAttribute("content", content);
};

/**
 * Helper to update or create the canonical <link> tag.
 */
const updateCanonical = (href) => {
    let element = document.querySelector('link[rel="canonical"]');
    if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
        document.head.appendChild(element);
    }
    element.setAttribute("href", href);
};

/**
 * Custom hook to update document title, description, canonical link, and Open Graph tags per page.
 * Solves Screaming Frog / Google duplicate title & description issues in React SPAs.
 *
 * @param {Object} options
 * @param {string} options.title - Page title (appended with default site branding if not already present)
 * @param {string} options.description - Meta description (50 - 160 characters recommended)
 * @param {string} [options.canonical] - Optional explicit canonical URL (defaults to window.location.href without query)
 * @param {boolean} [options.noindex] - If true, tags page with noindex, nofollow (e.g. for admin routes)
 */
export const usePageSEO = ({
    title,
    description,
    canonical,
    noindex = false,
}) => {
    const location = useLocation();

    useEffect(() => {
        // 1. Title
        const formattedTitle = title?.includes("Denny Charles Raj") || title?.includes("DCR")
            ? title
            : `${title} | Denny Charles Raj`;
        document.title = formattedTitle;

        // 2. Canonical URL
        const currentUrl = typeof window !== "undefined"
            ? `${window.location.origin}${location.pathname}`
            : "";
        const targetCanonical = canonical || currentUrl;
        if (targetCanonical) {
            updateCanonical(targetCanonical);
        }

        // 3. Meta Description
        if (description) {
            updateMeta("name", "description", description);
            updateMeta("property", "og:description", description);
            updateMeta("name", "twitter:description", description);
        }

        // 4. Open Graph & Twitter Titles
        updateMeta("property", "og:title", formattedTitle);
        updateMeta("name", "twitter:title", formattedTitle);
        updateMeta("property", "og:url", targetCanonical);

        // 5. Robots indexing control
        if (noindex) {
            updateMeta("name", "robots", "noindex, nofollow");
        } else {
            updateMeta("name", "robots", "index, follow");
        }
    }, [title, description, canonical, noindex, location.pathname]);
};

export default usePageSEO;
