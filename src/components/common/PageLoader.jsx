import { createPortal } from "react-dom";
import Loader1 from "./loader/Loader1";

/**
 * PageLoader
 * Standardized full-screen or section-level loading indicator across the portfolio.
 */
const PageLoader = ({ fullScreen = true, message }) => {
    const content = (
        <div
            className={
                fullScreen
                    ? "fixed inset-0 z-[99999] flex items-center justify-center bg-[#0c0a09] text-[#faf8f5]"
                    : "min-h-[60vh] flex items-center justify-center bg-transparent text-[#faf8f5]"
            }
            role="status"
            aria-live="polite"
        >
            <div className="text-center space-y-3">
                <Loader1 />
                {message && (
                    <p className="text-xs font-mono text-stone-500 uppercase tracking-wider animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );

    if (fullScreen && typeof document !== "undefined") {
        return createPortal(content, document.body);
    }

    return content;
};

export default PageLoader;
