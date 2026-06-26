import { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Coffee, Code, Palette } from 'lucide-react';

const AboutMe = ({ about }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const sectionRef = useRef(null);
    const observerRef = useRef(null);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Intersection Observer for scroll animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Optional: stop observing after animation completes
                    if (observerRef.current) {
                        observerRef.current.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observerRef.current = observer;
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Memoize highlights to prevent unnecessary re-renders
    const highlights = useMemo(() => [
        { Icon: Code, text: "Clean Code Enthusiast", color: "from-blue-400 to-blue-600" },
        { Icon: Palette, text: "Design Lover", color: "from-purple-400 to-purple-600" },
        { Icon: Coffee, text: "Coffee Powered", color: "from-amber-400 to-amber-600" },
        { Icon: Heart, text: "Passionate Creator", color: "from-pink-400 to-pink-600" },
    ], []);

    if (!about) {
        return (
            <section className="relative py-32 px-6 bg-slate-50">
                <div className="relative max-w-6xl mx-auto text-center">
                    <p className="text-gray-500">No about information provided</p>
                </div>
            </section>
        );
    }


    const animationDuration = prefersReducedMotion ? 'duration-0' : 'duration-1000';

    return (
        <section ref={sectionRef} className="relative py-20 md:py-32 px-6 bg-slate-50 overflow-hidden" data-section="about">
            {/* Decorative Elements - Animated Orbs */}
            <div
                className="absolute top-0 left-0 w-64 md:w-72 h-64 md:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform"
                style={{
                    animation: !prefersReducedMotion ? 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                }}
            />
            <div
                className="absolute bottom-0 right-0 w-64 md:w-72 h-64 md:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform"
                style={{
                    animation: !prefersReducedMotion ? 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s' : 'none'
                }}
            />

            <div className="relative max-w-6xl mx-auto">
                {/* Section Header Group */}
                <div
                    className={`text-center mb-12 md:mb-16 transition-all ${animationDuration} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                >
                    {/* Badge */}
                    <div className="inline-block mb-6">
                        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs md:text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow">
                            Get to know me
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 mb-6">
                        About Me
                    </h2>

                    {/* Decorative Underline */}
                    <div className="w-20 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* About Text Section - Now stretches to full height */}
                    <div
                        className={`lg:col-span-2 transition-all ${animationDuration} delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                            }`}
                    >
                        <article className="bg-white rounded-3xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full flex flex-col">
                            {/* About Content - Takes available space */}
                            <div className="flex-1">
                                <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-line">
                                    {about}
                                </p>
                            </div>

                            {/* Decorative Quote Section - Stays at bottom */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <blockquote className="text-xl md:text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 italic">
                                    "Design is not just what it looks like, it's how it works."
                                </blockquote>
                            </div>
                        </article>
                    </div>

                    {/* Highlights Cards Group - Now matches height */}
                    <div
                        className={`hidden lg:block transition-all ${animationDuration} delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                            }`}
                    >
                        <div className="h-full flex flex-col justify-between gap-4">
                            {highlights.map(({ Icon, text, color }, idx) => (
                                <div
                                    key={idx}
                                    className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 focus-within:ring-2 focus-within:ring-purple-500 flex-1 flex items-center"
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        {/* Icon Container */}
                                        <div
                                            className={`p-3 rounded-xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                                        >
                                            <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                                        </div>

                                        {/* Text */}
                                        <span className="font-semibold text-gray-800 text-sm md:text-base">
                                            {text}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Animations */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.2;
                    }
                    50% {
                        opacity: 0.3;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default AboutMe;
