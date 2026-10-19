import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * PageError
 * Standardized obsidian-themed error message container with optional retry action.
 */
const PageError = ({
    error = "An unexpected error occurred.",
    onRetry,
    fullScreen = true,
}) => {
    const containerClasses = fullScreen
        ? "min-h-screen flex items-center justify-center bg-[#0c0a09] px-6"
        : "min-h-[60vh] flex items-center justify-center px-6";

    const errorMessage =
        typeof error === "string" ? error : error?.message || "Failed to load content.";

    return (
        <div className={containerClasses} role="alert">
            <div className="max-w-md w-full bg-stone-900/90 border border-red-500/40 rounded-2xl p-8 text-center backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-[#faf8f5] mb-2">Unable to Load Data</h3>

                <p className="text-red-400 font-mono text-xs md:text-sm mb-6 leading-relaxed">
                    {errorMessage}
                </p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        type="button"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium text-xs font-mono transition-all hover:scale-105 active:scale-95 shadow-md shadow-red-950/50"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default PageError;
