import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Briefcase, Mail, Terminal } from "lucide-react";

const Navbar = () => {
    const location = useLocation();
    const activePage = location.pathname;
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollYRef = useRef(0);

    // Intro entrance delay on Home landing: gently float in lockstep with the primary CTAs
    const isHome = location.pathname === "/";
    const isFirstVisitHome = isHome && (typeof window !== "undefined" && !sessionStorage.getItem("dcr_visited_home"));
    const [isIntroHeld, setIsIntroHeld] = useState(() => isFirstVisitHome);
    const [introDone, setIntroDone] = useState(() => !isFirstVisitHome);

    useEffect(() => {
        if (!isHome || !isFirstVisitHome) {
            setIsIntroHeld(false);
            setIntroDone(true);
            return;
        }

        setIsIntroHeld(true);
        setIntroDone(false);

        let doneTimer;
        const timer = setTimeout(() => {
            setIsIntroHeld(false);
            doneTimer = setTimeout(() => setIntroDone(true), 1100);
        }, 3500);

        return () => {
            clearTimeout(timer);
            clearTimeout(doneTimer);
        };
    }, [isHome]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // If user scrolls during the intro delay, immediately unlock normal navbar behavior
            if (isIntroHeld) {
                setIsIntroHeld(false);
                setIntroDone(true);
            }

            const diff = currentScrollY - lastScrollYRef.current;

            if (currentScrollY < 15) {
                setIsVisible(true);
                lastScrollYRef.current = currentScrollY;
            } else if (Math.abs(diff) > 10) {
                // Desktop top bar hides on scroll down and reveals on scroll up;
                // mobile bottom docked bar remains persistently visible via responsive classes.
                setIsVisible(diff <= 0);
                lastScrollYRef.current = currentScrollY;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isIntroHeld]);

    const navLinks = [
        { path: "/", label: "Home", icon: Home },
        { path: "/projects", label: "Projects", icon: Briefcase },
        { path: "/contact", label: "Contact", icon: Mail }
    ];

    // During intro, match the CTA's soft duration-1000 float (sliding up on mobile, down on desktop)
    // After intro, desktop glides off-screen on scroll down while mobile stays docked at the bottom
    const transitionClass = !introDone
        ? "transition-all duration-1000 ease-out motion-reduce:transition-none"
        : "md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

    const visibilityClass = !introDone
        ? isIntroHeld
            ? "opacity-0 translate-y-6 md:-translate-y-6 pointer-events-none"
            : "opacity-100 translate-y-0"
        : isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-0 md:-translate-y-full opacity-100 md:pointer-events-none";

    return (
        <nav
            aria-label="Primary"
            className={`fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50 bg-[#0c0a09]/90 md:bg-[#0c0a09]/80 backdrop-blur-xl border-t md:border-t-0 md:border-b border-stone-800/80 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] pt-1 pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] md:p-0 ${transitionClass} ${visibilityClass}`}
        >
            <div className="max-w-7xl mx-auto md:px-6 md:py-3.5">
                <div className="flex justify-center md:justify-between items-center">

                    {/* Desktop Logo with Rich Red Dot & Terminal Glyph */}
                    <Link
                        to="/"
                        className="hidden md:flex group items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                    >
                        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 text-red-500 transition-all duration-200 group-hover:border-red-500/50 group-hover:bg-red-500/10 shadow-sm">
                            <Terminal aria-hidden="true" className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold tracking-tight text-[#faf8f5] group-hover:text-white transition-colors">
                                DCR<span className="text-red-500">.</span>
                            </span>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider -mt-1">
                                Developer
                            </span>
                        </div>
                    </Link>

                    {/* Unified Responsive Nav Links: 3-column docked bar on mobile, floating pill on desktop */}
                    <ul className="grid grid-cols-3 w-full gap-1 md:w-auto md:flex md:items-center md:gap-1 md:bg-stone-900/60 md:p-1 md:rounded-full md:border md:border-stone-800/80 md:backdrop-blur-md">
                        {navLinks.map((link) => {
                            const isActive = activePage === link.path;

                            return (
                                <li key={link.path} className="flex">
                                    <Link
                                        to={link.path}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`relative w-full min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 px-2 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-full text-[10px] md:text-xs font-medium transition-all duration-200 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${
                                            isActive
                                                ? "bg-red-500/[0.1] md:bg-red-500/[0.08] text-red-200 font-semibold border border-red-500/35 md:border-red-500/30 shadow-sm shadow-red-950/30"
                                                : "text-stone-400 hover:text-[#faf8f5] hover:bg-stone-800/40 border border-transparent"
                                        }`}
                                    >
                                        <link.icon
                                            aria-hidden="true"
                                            className={`w-3.5 h-3.5 ${isActive ? "text-red-500" : "text-stone-400"}`}
                                        />
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
