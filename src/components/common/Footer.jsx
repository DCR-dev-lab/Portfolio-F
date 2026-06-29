import {useEffect, useState} from "react";

import { Link } from "react-router-dom";
import {
    Heart,
    Github,
    Linkedin,
    Twitter,
    Instagram,
    Mail,
    Sparkles
} from "lucide-react";

import {getProfile} from "../../services/profile.service";

const Footer = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileRes = await getProfile();
                setProfile(profileRes.data ?? null);
                console.log("Profile data loaded:", profileRes.data);
            } catch (err) {
                console.error("Failed to load profile:", err);
            }
        };
        loadProfile();
    }, []);

    const socialLinks = [
        { icon: Github, url: profile?.socialLinks?.github || "https://github.com", label: "GitHub", color: "hover:text-gray-400" },
        { icon: Linkedin, url: profile?.socialLinks?.linkedin || "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-400" },
        { icon: Twitter, url: profile?.socialLinks?.twitter || "https://twitter.com", label: "Twitter", color: "hover:text-sky-400" },
        { icon: Instagram, url: profile?.socialLinks?.instagram || "https://instagram.com", label: "Instagram", color: "hover:text-pink-400" }
    ];



    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { path: "/", label: "Home" },
        { path: "/projects", label: "Projects" },
        { path: "/contact", label: "Contact" }
    ];

    return (
        <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-t border-white/10 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500 rounded-full blur-xl opacity-50"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">

                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                DCR
                            </span>
                        </Link>

                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Building beautiful, functional web experiences with passion and creativity.
                        </p>

                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
                            <span>and coffee</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <div className="h-px w-8 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            Quick Links
                        </h3>

                        <div className="space-y-3">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="block text-gray-400 hover:text-white transition-all hover:translate-x-1"
                                >
                                    → {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <div className="h-px w-8 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            Connect
                        </h3>

                        <div className="flex gap-3 mb-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={social.label}
                                    className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all text-gray-400 ${social.color}`}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>

                        <a
                            href="mailto:dennycharlesraj22@gmail.com"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                        >
                            <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-sm">dennycharlesraj22@gmail.com</span>
                        </a>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p className="text-gray-400">
                        © {currentYear} <span className="text-purple-400 font-semibold">DCR</span>. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6 text-gray-400">
                        <Link to="/privacy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
