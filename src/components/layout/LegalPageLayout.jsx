import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Shield,
    FileText,
    ArrowLeft,
    CheckCircle2,
    Mail,
    Sparkles,
} from "lucide-react";

/**
 * LegalPageLayout
 * Reusable layout shell for technical legal pages (Privacy Policy, Terms of Service).
 * Provides top switcher bar, ToC quick-jump buttons, numbered section cards, and bottom inquiry banner.
 */
const LegalPageLayout = ({
    currentTab = "privacy", // "privacy" | "terms"
    badge = "Legal & Transparency",
    title,
    description,
    lastUpdated = "October 2026",
    effective = "Immediate",
    version = "Version 1.2",
    sections = [],
    contactTitle = "Questions or Legal Inquiries?",
    contactDescription = "If you have questions regarding these terms or your data, feel free to reach out directly.",
    contactEmail = "dennycharls77@gmail.com",
}) => {
    const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    return (
        <div className="pt-28 pb-24 px-6 max-w-5xl mx-auto">
            {/* Top Navigation Switcher: Privacy vs Terms */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-10 pb-6 border-b border-stone-800/80">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-red-400 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Portfolio</span>
                </Link>

                <div className="inline-flex p-1 rounded-full bg-stone-900/90 border border-stone-800/90 backdrop-blur-md">
                    {currentTab === "privacy" ? (
                        <span className="px-4 py-1.5 rounded-full bg-stone-800 text-[#faf8f5] text-xs font-medium border border-stone-700/60 shadow-sm flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-red-500" />
                            <span>Privacy Policy</span>
                        </span>
                    ) : (
                        <Link
                            to="/privacy"
                            className="px-4 py-1.5 rounded-full text-stone-400 hover:text-[#faf8f5] text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                            <Shield className="w-3.5 h-3.5 text-stone-500" />
                            <span>Privacy Policy</span>
                        </Link>
                    )}

                    {currentTab === "terms" ? (
                        <span className="px-4 py-1.5 rounded-full bg-stone-800 text-[#faf8f5] text-xs font-medium border border-stone-700/60 shadow-sm flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-red-500" />
                            <span>Terms of Service</span>
                        </span>
                    ) : (
                        <Link
                            to="/terms"
                            className="px-4 py-1.5 rounded-full text-stone-400 hover:text-[#faf8f5] text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                            <FileText className="w-3.5 h-3.5 text-stone-500" />
                            <span>Terms of Service</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Page Header */}
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-500/25 text-red-400 text-xs font-mono uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                    <span>{badge}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#faf8f5] mb-4">
                    {title}<span className="text-red-500">.</span>
                </h1>

                <p className="text-stone-400 text-base sm:text-lg max-w-3xl leading-relaxed mb-4">
                    {description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-stone-500">
                    <span className="px-2.5 py-1 rounded-md bg-stone-900 border border-stone-800">
                        Last Updated: {lastUpdated}
                    </span>
                    <span>•</span>
                    <span>Effective: {effective}</span>
                    <span>•</span>
                    <span className="text-stone-400">{version}</span>
                </div>
            </div>

            {/* Quick-Jump Section Navigator */}
            {sections.length > 0 && (
                <div className="mb-12 p-3 rounded-2xl bg-stone-900/50 border border-stone-800/80 backdrop-blur-md overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 min-w-max">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                                    activeSection === section.id
                                        ? "bg-stone-800 text-[#faf8f5] border border-stone-700/80 shadow-sm"
                                        : "text-stone-400 hover:text-stone-200 hover:bg-stone-850"
                                }`}
                            >
                                <span className="text-red-400">{section.index}</span>
                                <span>{section.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Policy Sections */}
            <div className="space-y-6">
                {sections.map((section) => {
                    const Icon = section.icon;

                    return (
                        <section
                            key={section.id}
                            id={section.id}
                            className="bg-stone-900/40 border border-stone-800/80 hover:border-stone-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    {Icon && (
                                        <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-red-400 flex-shrink-0">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-xs font-mono text-red-400 tracking-wider">
                                            SECTION {section.index}
                                        </span>
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#faf8f5] tracking-tight">
                                            {section.title}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <p className="text-stone-300 text-sm sm:text-base font-medium mb-5">
                                {section.summary}
                            </p>

                            {section.details && section.details.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-stone-800/60">
                                    {section.details.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-stone-400 text-sm leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-red-500/80 flex-shrink-0 mt-1" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>

            {/* Bottom Contact Inquiries Card */}
            <div className="mt-14 p-8 rounded-3xl bg-stone-900/40 border border-stone-800/80 backdrop-blur-md text-center max-w-2xl mx-auto">
                <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-500/25 flex items-center justify-center mx-auto mb-4 text-red-400">
                    <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#faf8f5] mb-2">
                    {contactTitle}
                </h3>
                <p className="text-stone-400 text-sm mb-6 leading-relaxed">
                    {contactDescription}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                        href={`mailto:${contactEmail}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm shadow-red-900/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{contactEmail}</span>
                    </a>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                    >
                        <span>Contact Page</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LegalPageLayout;
