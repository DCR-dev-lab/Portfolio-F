/**
 * SectionHeader
 * Reusable section title component following the Warm Obsidian design system.
 * Renders a crimson pill badge, primary heading, and lead subtitle.
 */
const SectionHeader = ({
    badge,
    icon: Icon,
    title,
    subtitle,
    align = "center", // "center" | "left"
    as = "h2", // "h1" | "h2"
    className = "",
    children,
}) => {
    const isCenter = align === "center";
    const HeadingTag = as;

    return (
        <div className={`${isCenter ? "text-center mx-auto" : "text-left"} ${className}`}>
            {badge && (
                <div
                    className={`inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-500/25 text-red-400 text-xs font-mono uppercase tracking-wider ${
                        isCenter ? "justify-center" : ""
                    }`}
                >
                    {Icon && <Icon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" aria-hidden="true" />}
                    <span>{badge}</span>
                </div>
            )}

            {title && (
                <HeadingTag className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#faf8f5] mb-4">
                    {title}
                </HeadingTag>
            )}

            {subtitle && (
                <p
                    className={`text-stone-400 text-base md:text-lg leading-relaxed ${
                        isCenter ? "max-w-2xl mx-auto" : "max-w-3xl"
                    }`}
                >
                    {subtitle}
                </p>
            )}

            {children}
        </div>
    );
};

export default SectionHeader;
