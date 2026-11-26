import { Github, Linkedin, Twitter, Instagram, ExternalLink, ArrowUpRight } from "lucide-react";
import StarfieldButton from "./StarfieldButton";
import { isSafeUrl, sanitizeHref } from "../../utils/security";

const PLATFORM_CONFIG = [
    { key: "github", label: "GitHub", icon: Github, defaultUrl: "https://github.com" },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin, defaultUrl: "https://linkedin.com" },
    { key: "twitter", label: "Twitter", icon: Twitter, defaultUrl: "https://twitter.com" },
    { key: "instagram", label: "Instagram", icon: Instagram, defaultUrl: "https://instagram.com" },
];

/**
 * SocialLinks
 * Reusable social links component supporting multiple visual variants:
 * - "circles": small circular icon buttons (used in Hero)
 * - "squares": small squircle icon buttons (used in Footer)
 * - "list": detailed list rows with platform name & external link icon
 * - "rows": hairline editorial rows with no outer card containment (used in Contact)
 */
const SocialLinks = ({
    socialLinks = {},
    variant = "circles", // "circles" | "squares" | "list" | "rows"
    fallbackToDefaults = false,
    className = "",
}) => {
    const activeLinks = PLATFORM_CONFIG.map((platform) => {
        const rawUrl = socialLinks?.[platform.key];
        const url = rawUrl || (fallbackToDefaults ? platform.defaultUrl : null);
        return {
            ...platform,
            url: sanitizeHref(url),
            isValid: isSafeUrl(url, { allowMailTel: false }),
        };
    }).filter((item) => item.isValid);

    if (activeLinks.length === 0) {
        if (variant === "rows") {
            return (
                <p className="text-[var(--color-muted)] text-base py-2">
                    No social links configured
                </p>
            );
        }
        if (variant === "list") {
            return (
                <p className="text-stone-500 text-xs font-mono py-2">
                    No social links configured
                </p>
            );
        }
        return null;
    }

    if (variant === "rows") {
        return (
            <div className={`contact-social-stack ${className}`}>
                {activeLinks.map(({ key, label, url, icon: Icon }) => (
                    <StarfieldButton
                        key={key}
                        label={label}
                        link={url}
                        newTab={true}
                        icon={<Icon className="w-4 h-4 shrink-0 text-stone-200" aria-hidden="true" />}
                        endIcon={<ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-stone-200 opacity-90" aria-hidden="true" />}
                        padding="11px 18px"
                        rounded={100}
                        ariaLabel={`Visit ${label} profile`}
                        style={{ width: "100%" }}
                    />
                ))}
            </div>
        );
    }

    if (variant === "list") {
        return (
            <div className={`space-y-2.5 ${className}`}>
                {activeLinks.map(({ key, label, url, icon: Icon }) => (
                    <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-stone-300 hover:text-red-400 hover:border-red-500/30 hover:bg-stone-850 transition-all group"
                        aria-label={`Visit ${label} profile`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 group-hover:text-red-400 transition-colors">
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium font-mono">{label}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-red-400 transition-colors" />
                    </a>
                ))}
            </div>
        );
    }

    if (variant === "squares") {
        return (
            <div className={`flex gap-2 ${className}`}>
                {activeLinks.map(({ key, label, url, icon: Icon }) => (
                    <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                    >
                        <Icon className="w-4 h-4" />
                    </a>
                ))}
            </div>
        );
    }

    // Default "circles" variant with WCAG 44px mobile touch targets
    return (
        <div className={`flex items-center justify-center gap-1.5 sm:gap-2.5 ${className}`}>
            {activeLinks.map(({ key, label, url, icon: Icon }) => (
                <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit ${label} profile`}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center group"
                >
                    <span className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-stone-900/80 border border-stone-800 flex items-center justify-center text-stone-400 group-hover:text-red-400 group-hover:border-stone-700 group-hover:bg-stone-850 transition-all duration-200">
                        <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                    </span>
                </a>
            ))}
        </div>
    );
};

export default SocialLinks;
