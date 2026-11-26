import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * WhisperFooter
 * Shared whisper-quiet baseline footer matching Home's ContactCTA closure.
 * Used by both Home (ContactCTA) and Contact.
 */
const WhisperFooter = ({ className = "" }) => {
  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.__lenis && !reduced) {
      window.__lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  };

  return (
    <footer
      className={`relative z-10 w-full border-t border-stone-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500 pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:pb-0 ${className}`.trim()}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none"
        />
        <span>© {CURRENT_YEAR} Denny Charles Raj. All systems operational.</span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <Link
          to="/privacy"
          className="min-h-[44px] inline-flex items-center px-1.5 py-1 text-stone-400 hover:text-stone-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 rounded"
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms"
          className="min-h-[44px] inline-flex items-center px-1.5 py-1 text-stone-400 hover:text-stone-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 rounded"
        >
          Terms of Service
        </Link>
        <button
          type="button"
          onClick={scrollToTop}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-2 py-1 text-stone-400 hover:text-red-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 rounded"
          aria-label="Back to top"
        >
          <span>Top</span>
          <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
};

export default WhisperFooter;
