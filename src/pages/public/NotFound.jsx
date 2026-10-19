import { Link } from "react-router-dom";
import { Terminal, ArrowLeft, Home } from "lucide-react";
import usePageSEO from "../../hooks/usePageSEO";

const NotFound = () => {
    usePageSEO({
        title: "Page Not Found (404)",
        description: "The requested page could not be found on Denny Charles Raj's portfolio.",
        noindex: true,
    });

    return (
        <div className="pt-32 pb-24 px-6 flex items-center justify-center min-h-[70vh]">
            <div className="max-w-xl mx-auto text-center">
                {/* 404 Badge */}
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-widest shadow-sm">
                    <Terminal className="w-3.5 h-3.5 text-red-400" />
                    <span>Error 404 • Resource Not Found</span>
                </div>

                {/* Monumental Error Code */}
                <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight text-[#faf8f5] mb-4 font-mono">
                    404<span className="text-red-500">.</span>
                </h1>

                <h2 className="text-xl sm:text-2xl font-medium text-stone-300 mb-3 tracking-tight">
                    Route Coordinates Untraceable
                </h2>

                <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
                    The requested page or asset does not exist on this server, or has been moved to a new route.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-900/30"
                    >
                        <Home className="w-4 h-4" />
                        <span>Return Home</span>
                    </Link>

                    <Link
                        to="/projects"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-900 border border-stone-800 text-stone-300 font-medium text-sm hover:bg-stone-850 hover:text-white hover:border-stone-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>View Projects</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
