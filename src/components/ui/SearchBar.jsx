import { Search, X } from "lucide-react";

/**
 * SearchBar
 * Reusable obsidian-themed search input with leading Search icon and clear button.
 */
const SearchBar = ({
    value = "",
    onChange,
    onClear,
    placeholder = "Search...",
    className = "",
    inputClassName = "",
    ...props
}) => {
    const handleClear = () => {
        if (onClear) {
            onClear();
        } else if (onChange) {
            onChange({ target: { value: "" } });
        }
    };

    return (
        <div className={`relative ${className}`}>
            <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none"
                aria-hidden="true"
            />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-stone-900/60 border border-stone-800 rounded-xl pl-11 pr-11 py-3 text-sm text-[#faf8f5] placeholder-stone-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all font-normal ${inputClassName}`}
                {...props}
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors cursor-pointer"
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
