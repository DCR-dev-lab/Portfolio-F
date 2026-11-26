/**
 * Shared dark-themed form primitives for Mod Studio CMS pages.
 */

export const FieldLabel = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-stone-400">
        {children}
    </label>
);

export const DarkInput = ({ icon: Icon, className = "", ...props }) => (
    <div className="relative">
        {Icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                <Icon size={14} />
            </span>
        )}
        <input
            {...props}
            className={`w-full rounded-lg border border-stone-700/70 bg-stone-900 py-2.5 text-sm text-cream placeholder-stone-600 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                Icon ? "pl-9 pr-3.5" : "px-3.5"
            } ${className}`}
        />
    </div>
);

export const DarkSelect = ({ children, className = "", ...props }) => (
    <select
        {...props}
        className={`w-full rounded-lg border border-stone-700/70 bg-stone-900 px-3.5 py-2.5 text-sm text-cream outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${className}`}
    >
        {children}
    </select>
);

export const DarkTextarea = ({ rows = 4, className = "", ...props }) => (
    <textarea
        rows={rows}
        {...props}
        className={`w-full resize-y rounded-lg border border-stone-700/70 bg-stone-900 px-3.5 py-2.5 text-sm text-cream placeholder-stone-600 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${className}`}
    />
);

export const Section = ({ title, children }) => (
    <div className="rounded-xl border border-stone-800/70 bg-stone-900/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-stone-300">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);
