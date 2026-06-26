import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Briefcase, Mail, Sparkles, Code2 } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const activePage = location.pathname;
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 10) {
                // Always show navbar at the top
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY) {
                // Scrolling down - hide navbar
                setIsVisible(false);
                setIsOpen(false); // Close mobile menu when hiding
            } else {
                // Scrolling up - show navbar
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [lastScrollY]);

    const navLinks = [
        { path: "/", label: "Home", icon: Home },
        { path: "/projects", label: "Projects", icon: Briefcase },
        { path: "/skills", label: "Skills", icon: Code2 },
        { path: "/contact", label: "Contact", icon: Mail }
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="group flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            DCR
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => {
                            const isActive = activePage === link.path;

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-6 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${isActive ? "text-white" : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                    )}
                                    <link.icon
                                        className={`w-4 h-4 relative z-10 ${isActive ? "animate-pulse" : ""
                                            }`}
                                    />
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                        {isOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>

                {/* Mobile Nav */}
                {isOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
                        {navLinks.map((link) => {
                            const isActive = activePage === link.path;

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${isActive
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                        : "text-gray-300 hover:bg-white/10"
                                        }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
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
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
