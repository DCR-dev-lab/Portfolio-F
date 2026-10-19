import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Briefcase, Mail, Code2, Terminal } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const activePage = location.pathname;
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollYRef = useRef(0);

    // Intro entrance delay on Home landing: gently float down in lockstep with the primary CTAs
    const isHome = location.pathname === "/";
    const [isIntroHeld, setIsIntroHeld] = useState(isHome);
    const [introDone, setIntroDone] = useState(!isHome);

    useEffect(() => {
        if (!isHome) {
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
                if (diff > 0) {
                    // Scrolling DOWN: smoothly slide navbar up and out of view
                    setIsVisible(false);
                    setIsOpen(false);
                } else {
                    // Scrolling UP: smoothly slide navbar down into view
                    setIsVisible(true);
                }
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
        { path: "/skills", label: "Skills", icon: Code2 },
        { path: "/contact", label: "Contact", icon: Mail }
    ];

    // During intro, match the CTA's soft duration-1000 float (translating 24px and fading in)
    // During scroll, use a silky 500ms cubic-bezier slide that physically glides off screen without opacity flickering
    const transitionClass = !introDone
        ? "transition-all duration-1000 ease-out"
        : "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

    const visibilityClass = !introDone
        ? isIntroHeld
            ? "opacity-0 -translate-y-6 pointer-events-none"
            : "opacity-100 translate-y-0"
        : isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-100 pointer-events-none";

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 bg-[#0c0a09]/80 backdrop-blur-xl border-b border-stone-800/80 ${transitionClass} ${visibilityClass}`}
        >
            <div className="max-w-7xl mx-auto px-6 py-3.5">
                <div className="flex justify-between items-center">

                    {/* Logo with Rich Red Dot & Terminal Glyph */}
                    <Link to="/" className="group flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 text-red-500 transition-all duration-200 group-hover:border-red-500/50 group-hover:bg-red-500/10 shadow-sm">
                            <Terminal className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors" />
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

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1 bg-stone-900/60 p-1 rounded-full border border-stone-800/80 backdrop-blur-md">
                        {navLinks.map((link) => {
                            const isActive = activePage === link.path;

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                                        isActive
                                            ? "bg-stone-800/90 text-[#faf8f5] font-semibold border border-stone-700/60 shadow-sm"
                                            : "text-stone-400 hover:text-[#faf8f5] hover:bg-stone-800/40"
                                    }`}
                                >
                                    <link.icon className={`w-3.5 h-3.5 ${isActive ? "text-red-500" : "text-stone-400"}`} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation menu"
                        className="md:hidden w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-all"
                    >
                        {isOpen ? (
                            <X className="w-5 h-5 text-white" />
                        ) : (
                            <Menu className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>

                {/* Mobile Nav */}
                {isOpen && (
                    <div className="md:hidden mt-3 pb-3 space-y-1.5 border-t border-stone-800/80 pt-3 animate-fade-in">
                        {navLinks.map((link) => {
                            const isActive = activePage === link.path;

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                            ? "bg-stone-800/90 text-[#faf8f5] font-semibold border border-stone-700/60"
                                            : "text-stone-300 hover:bg-stone-900 hover:text-white"
                                    }`}
                                >
                                    <link.icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-stone-400"}`} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
