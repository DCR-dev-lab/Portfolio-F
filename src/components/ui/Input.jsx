/**
 * Input — theme-aware reusable input component.
 * Pass dark={true} for the admin (Warm Obsidian) theme.
 * Default (no prop / dark={false}) uses the light public-site theme.
 */
const Input = ({ label, error, dark = false, className = "", ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label className={`block mb-1 text-sm font-medium ${dark ? "text-stone-400" : "text-gray-700"}`}>
                    {label}
                </label>
            )}

            <input
                {...props}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition ${
                    dark
                        ? "border-stone-700/70 bg-stone-900 text-cream placeholder-stone-600 focus:border-crimson/60 focus:ring-1 focus:ring-crimson/30"
                        : "border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                } ${className}`}
            />

            {error && (
                <p className={`text-sm mt-1 ${dark ? "text-red-400" : "text-red-500"}`}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;