import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import portfolioPlaceholder from '../../../assets/images/portfolio-placeholder.svg';
import { 
    ArrowRight, 
    Download, 
    Mail, 
    Github, 
    Linkedin, 
    Twitter,
    Briefcase,
    Calendar,
    Award,
    MapPin,
    Sparkles,
    ChevronRight,
    Zap,
    Code2,
    Palette,
    Terminal,
    Layers,
    Globe
} from 'lucide-react';

const SplitScreenHero = ({
    // Personal Info
    name = "Alexandra Chen",
    title = "Senior Product Designer & Developer",
    description = "Bridging the gap between beautiful design and functional code. Creating digital experiences that users love and businesses need.",
    
    // Media
    imageUrl = portfolioPlaceholder,
    mediaType = "image", // 'image', 'video', 'illustration'
    mediaAlt = "Profile photo",
    
    // Split Configuration
    splitType = "diagonal", // 'straight', 'diagonal', 'wave', 'curve', 'zigzag'
    splitPosition = 50, // percentage
    splitColor = "#8B5CF6",
    
    // CTA Buttons
    primaryCTA = {
        text: "View Portfolio",
        icon: <Briefcase className="w-5 h-5" />,
        onClick: () => console.log('Portfolio clicked'),
        color: "#8B5CF6"
    },
    secondaryCTA = {
        text: "Download CV",
        icon: <Download className="w-5 h-5" />,
        onClick: () => console.log('CV downloaded'),
        color: "#06B6D4"
    },
    
    // Social Links
    socialLinks = [
        { platform: "github", url: "https://github.com", icon: <Github className="w-5 h-5" /> },
        { platform: "linkedin", url: "https://linkedin.com", icon: <Linkedin className="w-5 h-5" /> },
        { platform: "twitter", url: "https://twitter.com", icon: <Twitter className="w-5 h-5" /> },
        { platform: "email", url: "mailto:hello@example.com", icon: <Mail className="w-5 h-5" /> },
    ],
    
    // Stats
    stats = [
        { value: "5+", label: "Years Experience", icon: <Calendar className="w-4 h-4" /> },
        { value: "120+", label: "Projects", icon: <Layers className="w-4 h-4" /> },
        { value: "98%", label: "Client Satisfaction", icon: <Award className="w-4 h-4" /> },
        { value: "Global", label: "Remote Work", icon: <Globe className="w-4 h-4" /> },
    ],
    
    // Theme
    theme = "modern", // 'modern', 'minimal', 'bold', 'soft'
    animationSpeed = 1, // 0.5, 1, 2
    interactive = true,
    
    // Additional Info
    location = "San Francisco, CA",
    availability = "Available for freelance",
    tagline = "Design • Develop • Deliver",
    
    // Advanced Options
    backgroundPattern = true,
    floatingElements = true,
    parallaxEffect = true
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [splitHover, setSplitHover] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const containerRef = useRef(null);
    const splitLineRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Theme configurations
    const themes = {
        modern: {
            leftBg: 'from-gray-900 via-gray-800 to-gray-900',
            rightBg: 'from-white via-gray-50 to-white',
            textColor: 'text-gray-900',
            secondaryText: 'text-gray-600',
            accentColor: '#8B5CF6',
            pattern: 'grid'
        },
        minimal: {
            leftBg: 'from-slate-900 to-slate-800',
            rightBg: 'from-white to-gray-50',
            textColor: 'text-gray-900',
            secondaryText: 'text-gray-500',
            accentColor: '#3B82F6',
            pattern: 'lines'
        },
        bold: {
            leftBg: 'from-purple-900 via-purple-800 to-purple-900',
            rightBg: 'from-amber-50 to-yellow-50',
            textColor: 'text-gray-900',
            secondaryText: 'text-gray-700',
            accentColor: '#EC4899',
            pattern: 'dots'
        },
        soft: {
            leftBg: 'from-blue-900 via-indigo-900 to-blue-900',
            rightBg: 'from-cyan-50 to-blue-50',
            textColor: 'text-gray-800',
            secondaryText: 'text-gray-600',
            accentColor: '#06B6D4',
            pattern: 'waves'
        }
    };

    const currentTheme = themes[theme] || themes.modern;

    // Handle scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const progress = Math.min(scrollY / (windowHeight * 0.5), 1);
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle mouse movement for parallax
    const handleMouseMove = (e) => {
        if (!containerRef.current || !parallaxEffect) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
        
        // Update split hover effect
        const splitPositionNormalized = splitPosition / 100;
        setSplitHover(x - splitPositionNormalized);
    };

    // Get split path based on type
    const getSplitPath = () => {
        const position = splitPosition + (splitHover * 20); // Interactive shift
        const height = 100;

        switch (splitType) {
            case 'straight':
                return `M ${position} 0 L ${position} ${height}`;
            
            case 'diagonal': {
                const angle = 15 * splitHover; // Interactive angle shift
                return `M ${position} 0 L ${position + angle} ${height}`;
            }
            
            case 'curve':
                return `M ${position} 0 
                        C ${position + 10} ${height * 0.3}, 
                          ${position - 5} ${height * 0.7}, 
                          ${position} ${height}`;
            
            case 'wave':
                return `M ${position} 0 
                        Q ${position + 20} ${height * 0.25}, ${position} ${height * 0.5}
                        Q ${position - 20} ${height * 0.75}, ${position} ${height}`;
            
            case 'zigzag':
                return `M ${position} 0 
                        L ${position + 15} ${height * 0.25}
                        L ${position - 10} ${height * 0.5}
                        L ${position + 15} ${height * 0.75}
                        L ${position} ${height}`;
            
            default:
                return `M ${position} 0 L ${position} ${height}`;
        }
    };

    // Calculate parallax offsets
    const parallaxLeft = mousePosition.x * -20 + 10;
    const parallaxRight = mousePosition.x * 20 - 10;
    const scrollParallax = scrollProgress * 100;

    return (
        <div 
            ref={containerRef}
            className="relative min-h-screen overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => interactive && setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setSplitHover(0);
            }}
        >
            {/* Split Line SVG */}
            <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                <defs>
                    <linearGradient id="splitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={splitColor} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={splitColor} stopOpacity="0.3" />
                    </linearGradient>
                    
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                
                <path
                    ref={splitLineRef}
                    d={getSplitPath()}
                    stroke="url(#splitGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#glow)"
                    className="transition-all duration-700 ease-out"
                />
                
                {/* Animated dots along split line */}
                <AnimatePresence>
                    {Array.from({ length: 10 }).map((_, i) => {
                        const progress = i / 10;
                        const offsetX = Math.sin(Date.now() * 0.001 + i) * 5;
                        
                        return (
                            <motion.circle
                                key={i}
                                cx={splitPosition + splitHover * 20 + offsetX}
                                cy={`${progress * 100}%`}
                                r="3"
                                fill={splitColor}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ 
                                    opacity: 0.6, 
                                    scale: 1,
                                    cx: splitPosition + splitHover * 20 + offsetX,
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ 
                                    duration: 0.5,
                                    delay: i * 0.1,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    repeatDelay: 2
                                }}
                            />
                        );
                    })}
                </AnimatePresence>
            </svg>

            {/* LEFT SIDE - Visual */}
            <motion.div 
                className={`absolute top-0 left-0 h-full w-full bg-gradient-to-br ${currentTheme.leftBg} overflow-hidden`}
                style={{
                    clipPath: `polygon(0% 0%, ${splitPosition + splitHover * 20}% 0%, ${splitPosition + splitHover * 20}% 100%, 0% 100%)`,
                    transform: `translateX(${parallaxLeft * 0.5}px) translateY(${scrollParallax * 0.3}px)`,
                }}
                animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Background Pattern */}
                {backgroundPattern && (
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 30% 30%, ${splitColor} 1px, transparent 1px)`,
                            backgroundSize: '50px 50px',
                        }} />
                    </div>
                )}

                {/* Color Overlay */}
                <div 
                    className="absolute inset-0 mix-blend-overlay transition-all duration-700"
                    style={{
                        backgroundColor: splitColor,
                        opacity: isHovered ? 0.3 : 0.2,
                    }}
                />

                {/* Media Container */}
                <div className="relative h-full w-full flex items-center justify-center p-8 md:p-16">
                    <div className="relative w-full h-full max-w-4xl">
                        {/* Media Content */}
                        {mediaType === 'image' ? (
                            <motion.div 
                                className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 * animationSpeed, delay: 0.2 }}
                            >
                                <img 
                                    src={imageUrl}
                                    alt={mediaAlt}
                                    className="w-full h-full object-cover"
                                    style={{
                                        transform: `scale(${isHovered ? 1.05 : 1}) translateX(${parallaxLeft * 0.3}px)`,
                                        transition: 'transform 0.7s ease-out',
                                    }}
                                />
                                
                                {/* Image Frame */}
                                <div className="absolute inset-0 border-4 border-white/10 rounded-3xl" />
                                <div className="absolute inset-4 border-2 border-white/20 rounded-2xl" />
                            </motion.div>
                        ) : mediaType === 'video' ? (
                            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                                <video 
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                >
                                    <source src={imageUrl} type="video/mp4" />
                                </video>
                            </div>
                        ) : (
                            // Illustration placeholder
                            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <div className="text-white text-6xl">🎨</div>
                            </div>
                        )}

                        {/* Floating Elements */}
                        {floatingElements && (
                            <>
                                <motion.div 
                                    className="absolute -top-6 -left-6 w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center backdrop-blur-sm bg-black/20"
                                    animate={{ 
                                        y: [0, -10, 0],
                                        rotate: [0, 5, 0, -5, 0]
                                    }}
                                    transition={{ 
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Palette className="w-8 h-8 text-white/60" />
                                </motion.div>
                                
                                <motion.div 
                                    className="absolute -bottom-6 -right-6 w-20 h-20 rounded-xl border-2 border-white/20 flex items-center justify-center backdrop-blur-sm bg-black/20"
                                    animate={{ 
                                        y: [0, 10, 0],
                                        rotate: [0, -5, 0, 5, 0]
                                    }}
                                    transition={{ 
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5
                                    }}
                                >
                                    <Code2 className="w-6 h-6 text-white/60" />
                                </motion.div>
                                
                                <motion.div 
                                    className="absolute top-1/2 -right-12 w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center backdrop-blur-sm bg-black/20"
                                    animate={{ 
                                        x: [0, 10, 0],
                                        rotate: 360
                                    }}
                                    transition={{ 
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                >
                                    <Terminal className="w-5 h-5 text-white/60" />
                                </motion.div>
                            </>
                        )}

                        {/* Left Side Accent Text */}
                        <motion.div 
                            className="absolute -left-32 top-1/2 transform -translate-y-1/2 -rotate-90"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 * animationSpeed, delay: 0.5 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/30" />
                                <span className="text-white/40 font-mono text-sm tracking-widest uppercase">
                                    Visual Designer
                                </span>
                                <Sparkles className="w-4 h-4 text-white/40" />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Left Side Gradient Fade */}
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/30 to-transparent" />
            </motion.div>

            {/* RIGHT SIDE - Content */}
            <motion.div 
                className={`absolute top-0 right-0 h-full w-full bg-gradient-to-br ${currentTheme.rightBg} overflow-hidden`}
                style={{
                    clipPath: `polygon(${splitPosition + splitHover * 20}% 0%, 100% 0%, 100% 100%, ${splitPosition + splitHover * 20}% 100%)`,
                    transform: `translateX(${parallaxRight * 0.5}px) translateY(${scrollParallax * 0.3}px)`,
                }}
                animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Right Side Pattern */}
                {backgroundPattern && (
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `linear-gradient(45deg, ${splitColor}22 25%, transparent 25%, transparent 75%, ${splitColor}22 75%, ${splitColor}22),
                                           linear-gradient(45deg, ${splitColor}22 25%, transparent 25%, transparent 75%, ${splitColor}22 75%, ${splitColor}22)`,
                            backgroundSize: '60px 60px',
                            backgroundPosition: '0 0, 30px 30px',
                        }} />
                    </div>
                )}

                {/* Content Container */}
                <div className="relative h-full w-full flex items-center p-8 md:p-16">
                    <div className="max-w-2xl ml-auto">
                        <motion.div 
                            className="space-y-8"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 * animationSpeed, delay: 0.3 }}
                        >
                            {/* Tagline */}
                            <motion.div 
                                className="inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 * animationSpeed, delay: 0.4 }}
                                style={{ 
                                    backgroundColor: `${splitColor}10`,
                                    borderColor: `${splitColor}30`
                                }}
                            >
                                <Zap className="w-4 h-4" style={{ color: splitColor }} />
                                <span className="text-sm font-medium" style={{ color: splitColor }}>
                                    {tagline}
                                </span>
                            </motion.div>

                            {/* Name */}
                            <motion.h1 
                                className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight ${currentTheme.textColor}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1 * animationSpeed, delay: 0.5 }}
                            >
                                {name.split(' ').map((word, index) => (
                                    <motion.span
                                        key={index}
                                        className="inline-block mr-4 last:mr-0"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 * animationSpeed, delay: 0.6 + index * 0.1 }}
                                        whileHover={{ 
                                            scale: 1.05,
                                            color: splitColor,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </motion.h1>

                            {/* Title with Animated Underline */}
                            <motion.div 
                                className="relative"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8 * animationSpeed, delay: 0.8 }}
                            >
                                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-medium ${currentTheme.secondaryText} mb-3`}>
                                    {title}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="h-1 w-20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full"
                                            style={{
                                                background: `linear-gradient(90deg, ${splitColor}, ${secondaryCTA.color || '#06B6D4'})`,
                                                animation: 'shimmer 2s infinite',
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        {location}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Description */}
                            <motion.p 
                                className={`text-lg sm:text-xl ${currentTheme.secondaryText} leading-relaxed max-w-3xl`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8 * animationSpeed, delay: 0.9 }}
                            >
                                {description}
                            </motion.p>

                            {/* Stats */}
                            <motion.div 
                                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 * animationSpeed, delay: 1 }}
                            >
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-4 rounded-xl border backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                                        style={{ borderColor: `${splitColor}20` }}
                                        whileHover={{ y: -5, scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div 
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${splitColor}10` }}
                                            >
                                                <div style={{ color: splitColor }}>
                                                    {stat.icon}
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold" style={{ color: splitColor }}>
                                                {stat.value}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* CTA Buttons */}
                            <motion.div 
                                className="flex flex-col sm:flex-row gap-4 pt-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 * animationSpeed, delay: 1.1 }}
                            >
                                {/* Primary CTA */}
                                <button
                                    onClick={primaryCTA.onClick}
                                    className="group relative flex-1 px-8 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryCTA.color}, ${splitColor})`,
                                        boxShadow: `0 10px 30px ${primaryCTA.color}40`,
                                    }}
                                >
                                    <span className="relative z-10 text-white flex items-center justify-center gap-3">
                                        {primaryCTA.icon}
                                        {primaryCTA.text}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                    </div>
                                </button>

                                {/* Secondary CTA */}
                                <button
                                    onClick={secondaryCTA.onClick}
                                    className="group relative flex-1 px-8 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border-2"
                                    style={{
                                        borderColor: secondaryCTA.color,
                                        color: secondaryCTA.color,
                                    }}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {secondaryCTA.icon}
                                        {secondaryCTA.text}
                                    </span>
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                        style={{ backgroundColor: secondaryCTA.color }}
                                    />
                                </button>
                            </motion.div>

                            {/* Social Links & Availability */}
                            <motion.div 
                                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8 * animationSpeed, delay: 1.2 }}
                                style={{ borderColor: `${splitColor}20` }}
                            >
                                {/* Social Links */}
                                <div className="flex items-center gap-3">
                                    {socialLinks.map((link, index) => (
                                        <motion.a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl border backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                                            style={{ borderColor: `${splitColor}20` }}
                                            whileHover={{ y: -3, scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className="text-gray-600 hover:text-gray-900 transition-colors">
                                                {link.icon}
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>

                                {/* Availability */}
                                <motion.div 
                                    className="flex items-center gap-2 px-4 py-2 rounded-full"
                                    style={{ backgroundColor: `${splitColor}10` }}
                                    animate={{ 
                                        backgroundColor: [
                                            `${splitColor}10`,
                                            `${splitColor}20`,
                                            `${splitColor}10`
                                        ]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-medium" style={{ color: splitColor }}>
                                        {availability}
                                    </span>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Side Gradient Fade */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white/30 to-transparent" />
            </motion.div>

            {/* Interactive Split Line Handle */}
            {interactive && (
                <motion.div 
                    className="absolute top-1/2 z-20 transform -translate-y-1/2 cursor-ew-resize"
                    style={{ left: `${splitPosition + splitHover * 20}%` }}
                    drag="x"
                    dragConstraints={{ left: 20, right: 80 }}
                    dragElastic={0.1}
                    onDrag={(event, info) => {
                        const newPosition = (info.point.x / window.innerWidth) * 100;
                        setSplitHover((newPosition - splitPosition) / 20);
                    }}
                    onDragEnd={() => setSplitHover(0)}
                >
                    <div className="relative">
                        <div className="w-1 h-32 rounded-full bg-gradient-to-b from-white/50 via-white to-white/50" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-12 h-12 rounded-full backdrop-blur-xl bg-black/20 border-2 border-white/30 flex items-center justify-center">
                                <ChevronRight className="w-6 h-6 text-white/60" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Scroll Indicator */}
            <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
            >
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <span className="text-sm">Drag to adjust split</span>
                    <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1 h-4 rounded-full bg-gray-400"
                                animate={{ height: ['16px', '24px', '16px'] }}
                                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Theme Indicator */}
            <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-white/10">
                    <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: splitColor }}
                    />
                    <span className="text-sm text-white">
                        {splitType.charAt(0).toUpperCase() + splitType.slice(1)} Split
                    </span>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                
                /* Custom scrollbar for the container */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                }
                ::-webkit-scrollbar-thumb {
                    background: ${splitColor};
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: ${primaryCTA.color};
                }
            `}</style>
        </div>
    );
};

export default SplitScreenHero;
