import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Mail,
    Terminal,
    ArrowUpRight
} from "lucide-react";

import { getProfile } from "../../services/profile.service";
import PulseDot from "../ui/PulseDot";
import SocialLinks from "./SocialLinks";

const Footer = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileRes = await getProfile();
                setProfile(profileRes.data ?? null);
            } catch (err) {
                console.error("Failed to load profile for footer:", err);
            }
        };
        loadProfile();
    }, []);

    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { path: "/", label: "Home" },
        { path: "/projects", label: "Projects" },
        { path: "/skills", label: "Skills" },
        { path: "/contact", label: "Contact" }
    ];

    return (
        <footer className="relative bg-[#0c0a09] border-t border-stone-800/80 text-stone-400 overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

                    {/* Brand */}
                    <div className="md:col-span-2 space-y-4">
                        <Link to="/" className="inline-flex items-center gap-3 group">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-colors">
                                <Terminal className="w-4 h-4" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-[#faf8f5] group-hover:text-white transition-colors">
                                DCR<span className="text-red-500">.</span>
                            </span>
                        </Link>

                        <p className="text-stone-400 text-sm leading-relaxed max-w-sm font-normal">
                            Engineering resilient digital platforms and full-stack software with modern tools, clean architectures, and high visual craft.
                        </p>

                        <div className="flex items-center gap-2 pt-2">
                            <PulseDot />
                            <span className="text-xs font-mono text-stone-400">All systems operational</span>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div>
                        <h3 className="text-stone-200 font-semibold text-xs font-mono uppercase tracking-wider mb-4">
                            Navigation
                        </h3>
                        <div className="space-y-2.5 text-sm">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="block text-stone-400 hover:text-red-400 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="text-stone-200 font-semibold text-xs font-mono uppercase tracking-wider mb-4">
                            Connect
                        </h3>

                        <SocialLinks
                            socialLinks={profile?.socialLinks}
                            variant="squares"
                            fallbackToDefaults={true}
                            className="mb-4"
                        />

                        {profile?.email && (
                            <a
                                href={`mailto:${profile.email}`}
                                className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-red-400 transition-colors group"
                            >
                                <Mail className="w-3.5 h-3.5 text-red-400" />
                                <span>{profile.email}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-stone-800/80 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-stone-500">
                    <p>
                        © {currentYear} DCR. Built with React & Tailwind CSS.
                    </p>

                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="hover:text-stone-300 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-stone-300 transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
