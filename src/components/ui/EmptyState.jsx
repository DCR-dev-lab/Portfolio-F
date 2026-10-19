/**
 * EmptyState
 * Reusable obsidian-themed placeholder container for query lists with no results or empty data.
 */
const EmptyState = ({
    icon: Icon,
    title = "No results found",
    description,
    action,
    className = "",
}) => {
    return (
        <div
            className={`text-center py-20 px-6 bg-stone-900/30 border border-stone-800 rounded-2xl backdrop-blur-sm ${className}`}
        >
            {Icon && (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 mb-4">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
            )}
            <h3 className="text-lg font-bold text-[#faf8f5] mb-1">{title}</h3>
            {description && (
                <p className="text-stone-500 text-xs md:text-sm font-mono max-w-sm mx-auto leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export default EmptyState;
