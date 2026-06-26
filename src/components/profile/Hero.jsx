import { useState, useEffect, useRef } from 'react';
import {Link} from 'react-router-dom';
import { Github, Linkedin, Twitter, Instagram, Download, ArrowRight, Sparkles } from 'lucide-react';
import portfolioPlaceholder from '../../assets/images/portfolio-placeholder.svg';

const Hero = ({ profile, onScrollToNext }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentTitle, setCurrentTitle] = useState('');
    const [titleIndex, setTitleIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const animationFrameRef = useRef(null);

    const heroProfile = {
        fullName: "DCR",
        title: "Modern Designer & Developer",
        shortIntro: "Creating beautiful digital experiences",
        profilePictureUrl: portfolioPlaceholder,
        socialLinks: {},
        ...profile,
    };

    const {
        fullName,
        title,
        shortIntro,
        profilePictureUrl,
        resumeUrl,
        socialLinks
    } = heroProfile;

    // Typing effect for title
    useEffect(() => {
        if (!title) return;

        const titles = title.split('&').map(t => t.trim()).filter(Boolean);
        if (titles.length === 0) return;

        const currentFullTitle = titles[titleIndex % titles.length];

        const typingSpeed = isDeleting ? 50 : 100;
        const delayBetweenTitles = 2000;
        let delayTimer;

        const handleTyping = () => {
            if (!isDeleting && currentTitle.length < currentFullTitle.length) {
                // Typing
                setCurrentTitle(currentFullTitle.slice(0, currentTitle.length + 1));
            } else if (isDeleting && currentTitle.length > 0) {
                // Deleting
                setCurrentTitle(currentFullTitle.slice(0, currentTitle.length - 1));
            } else if (!isDeleting && currentTitle.length === currentFullTitle.length) {
                // Wait before deleting
                delayTimer = setTimeout(() => setIsDeleting(true), delayBetweenTitles);
                return;
            } else if (isDeleting && currentTitle.length === 0) {
                // Move to next title
                setIsDeleting(false);
                setTitleIndex((prev) => (prev + 1) % titles.length);
                return;
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => {
            clearTimeout(timer);
            clearTimeout(delayTimer);
        };
    }, [currentTitle, isDeleting, titleIndex, title]);

    useEffect(() => {
        setIsVisible(true);

        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();

        // Only enable mouse movement on desktop
        const handleMouseMove = (e) => {
            if (window.innerWidth > 768) {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }

                const { clientX, clientY } = e;
                animationFrameRef.current = requestAnimationFrame(() => {
                    setMousePosition({
                        x: (clientX / window.innerWidth) * 20,
                        y: (clientY / window.innerHeight) * 20
                    });
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', checkMobile);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Handle scroll to next section
    const handleScrollClick = () => {
        if (onScrollToNext) {
            onScrollToNext();
        } else {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        }
    };

    // Validate URLs
    const validateUrl = (url) => {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const socialIcons = [
        { Icon: Github, url: socialLinks.github, color: 'hover:text-gray-900', label: 'GitHub' },
        { Icon: Linkedin, url: socialLinks.linkedin, color: 'hover:text-blue-600', label: 'LinkedIn' },
        { Icon: Twitter, url: socialLinks.twitter, color: 'hover:text-sky-500', label: 'Twitter' },
        { Icon: Instagram, url: socialLinks.instagram, color: 'hover:text-pink-600', label: 'Instagram' },
    ].filter(s => s.url && validateUrl(s.url));

    return (
        <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 ">
            {/* Animated Background Gradient Orbs - Reduced animation on mobile */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className={`absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${!isMobile ? 'animate-pulse' : ''}`}
                    style={{
                        top: '10%',
                        left: '10%',
                        transform: !isMobile ? `translate(${mousePosition.x}px, ${mousePosition.y}px)` : 'none'
                    }}
                />
                <div
                    className={`absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${!isMobile ? 'animate-pulse' : ''}`}
                    style={{
                        top: '50%',
                        right: '10%',
                        transform: !isMobile ? `translate(-${mousePosition.x}px, -${mousePosition.y}px)` : 'none',
                        animationDelay: '1s'
                    }}
                />
                <div
                    className={`absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${!isMobile ? 'animate-pulse' : ''}`}
                    style={{
                        bottom: '10%',
                        left: '50%',
                        animationDelay: '2s'
                    }}
                />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

            {/* Main Content - Centered vertically with flex */}
            <div className="relative w-full h-full flex items-center overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-0">
                    {/* On mobile: stack vertically with proper order */}
                    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">

                        {/* Profile Image - ON TOP for mobile - LARGER SIZE */}
                        <div
                            className={`order-1 lg:order-2 flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                                }`}
                        >
                            <div className="relative group">
                                {/* Animated Ring */}
                                <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse" />

                                {/* Image Container - Larger on mobile */}
                                <div className="relative">
                                    <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-sm shadow-2xl mx-auto">
                                        {!imageLoaded && !imageError && (
                                            <div className="w-full h-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse flex items-center justify-center">
                                                <span className="text-white/50 text-xs md:text-sm">Loading...</span>
                                            </div>
                                        )}
                                        {imageError ? (
                                            <div className="w-full h-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                                <span className="text-white/50 text-xs md:text-sm text-center px-4">
                                                    Image failed to load
                                                </span>
                                            </div>
                                        ) : (
                                            <img
                                                src={profilePictureUrl}
                                                alt={`${fullName}'s profile picture`}
                                                className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                                onLoad={() => setImageLoaded(true)}
                                                onError={() => {
                                                    setImageError(true);
                                                    setImageLoaded(false);
                                                }}
                                                loading="eager"
                                                fetchPriority="high"
                                            />
                                        )}
                                    </div>

                                    {/* Floating Badge - Restored "Open to work" text */}
                                    <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 px-3 md:px-6 py-1.5 md:py-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xs md:text-base shadow-lg animate-bounce">
                                        <span className="flex items-center gap-1 md:gap-2">
                                            <span className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full animate-pulse" aria-hidden="true" />
                                            Open to work
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content - SECOND on mobile */}
                        <div
                            className={`order-2 lg:order-1 space-y-3 md:space-y-4 lg:space-y-6 text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                        >
                            {/* Greeting Badge - Centered on mobile */}
                            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs md:text-sm mx-auto lg:mx-0">
                                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                                <span>Available for new projects</span>
                            </div>

                            {/* Name with Gradient */}
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-1 md:mb-2 lg:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 leading-tight">
                                    Hi, I'm {fullName}
                                </h1>
                                <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-purple-200 font-light h-8 md:h-10 lg:h-auto">
                                    {currentTitle}
                                    <span className="animate-pulse">|</span>
                                </h2>
                            </div>

                            {/* Short Intro */}
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 max-w-xl leading-relaxed mx-auto lg:mx-0">
                                {shortIntro}
                            </p>

                            {/* CTA Buttons - Stack vertically on mobile */}
                            <div className="flex flex-col lg:justify-start sm:justify-center sm:flex-row gap-2 md:gap-3 lg:gap-4 pt-2 max-w-xs sm:max-w-none mx-auto sm:mx-0">
                                <Link
                                    to="/projects"  
                                    className=" group inline-flex items-center justify-center gap-2 px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-xs md:text-sm lg:text-base overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                                    aria-label="View my work portfolio"
                                >
                                    <span className="relative z-10">View My Work</span>
                                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="sm:flex-1 absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>

                                {resumeUrl && validateUrl(resumeUrl) && (
                                    <a
                                        href={resumeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className=" inline-flex items-center justify-center gap-2 px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-semibold text-xs md:text-sm lg:text-base hover:bg-white/20 hover:border-white/40 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        aria-label="Download resume"
                                    >
                                        <Download className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                        <span>Resume</span>
                                    </a>
                                )}
                            </div>

                            {/* Social Links - Centered on mobile */}
                            {socialIcons.length > 0 && (
                                <div className="flex justify-center lg:justify-start gap-2 md:gap-3 lg:gap-4 pt-2" role="list" aria-label="Social media links">
                                    {socialIcons.map(({ Icon, url, color, label }, idx) => (
                                        <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`Visit ${label} profile`}
                                            className={`p-1.5 md:p-2 lg:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${color}`}
                                            role="listitem"
                                        >
                                            <Icon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator - Hidden on mobile */}
            {!isMobile && (
                <button
                    onClick={handleScrollClick}
                    className="cursor-pointer absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-2"
                    aria-label="Scroll to next section"
                >
                    <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5 md:p-2 hover:border-white/50 transition-colors">
                        <div className="w-0.5 md:w-1 h-1.5 md:h-2 bg-white/50 rounded-full animate-pulse" />
                    </div>
                </button>
            )}

            {/* CSS for reduced motion */}
            <style jsx>{`
                @media (prefers-reduced-motion: reduce) {
                    .animate-pulse, .animate-bounce, .animate-spin {
                        animation: none !important;
                    }
                    .transition-all, .transition-transform, .transition-opacity {
                        transition: none !important;
                    }
                    .hover\\:scale-105:hover, .hover\\:scale-110:hover {
                        transform: none !important;
                    }
                    [class*="animate-"] {
                        animation: none !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default Hero;
