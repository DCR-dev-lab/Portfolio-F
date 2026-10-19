import { Github, Linkedin, Twitter, Instagram, ExternalLink } from "lucide-react";

const PLATFORM_CONFIG = [
    { key: "github", label: "GitHub", icon: Github, defaultUrl: "https://github.com" },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin, defaultUrl: "https://linkedin.com" },
    { key: "twitter", label: "Twitter", icon: Twitter, defaultUrl: "https://twitter.com" },
    { key: "instagram", label: "Instagram", icon: Instagram, defaultUrl: "https://instagram.com" },
];

const validateUrl = (url) => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * SocialLinks
 * Reusable social links component supporting multiple visual variants:
 * - "circles": small circular icon buttons (used in Hero)
 * - "squares": small squircle icon buttons (used in Footer)
 * - "list": detailed list rows with platform name & external link icon (used in Contact)
 */
const SocialLinks = ({
    socialLinks = {},
    variant = "circles", // "circles" | "squares" | "list"
    fallbackToDefaults = false,
    className = "",
}) => {
    const activeLinks = PLATFORM_CONFIG.map((platform) => {
        const rawUrl = socialLinks?.[platform.key];
        const url = rawUrl || (fallbackToDefaults ? platform.defaultUrl : null);
        return {
            ...platform,
            url,
            isValid: validateUrl(url),
        };
    }).filter((item) => item.isValid);

    if (activeLinks.length === 0) {
        if (variant === "list") {
            return (
                <p className="text-stone-500 text-xs font-mono py-2">
                    No social links configured
                </p>
            );
        }
        return null;
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

    // Default "circles" variant
    return (
        <div className={`flex items-center justify-center gap-2.5 ${className}`}>
            {activeLinks.map(({ key, label, url, icon: Icon }) => (
                <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit ${label} profile`}
                    className="w-8 h-8 rounded-full bg-stone-900/80 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-red-400 hover:border-stone-700 hover:bg-stone-850 transition-all duration-200"
                >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
            ))}
        </div>
    );
};

export default SocialLinks;
