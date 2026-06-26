import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Sparkles, Zap, Code2, Cpu, Palette, Terminal, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

const AnimatedMeshHero = ({
    name = "Alex Chen",
    title = "Full Stack Developer",
    description = "Crafting digital experiences with modern web technologies and creative solutions.",
    ctaText = "Explore My Work",
    onCTAClick,
    socialLinks = [],
    stats = [],
    theme = 'tech' // 'tech', 'creative', 'minimal', 'cyber'
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const [, setIsLoaded] = useState(false);

    // Theme configurations
    const themes = {
        tech: {
            colors: ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981'],
            icons: [<Cpu key="cpu" />, <Terminal key="term" />, <Code2 key="code" />, <Cloud key="cloud" />],
            pattern: 'grid',
            glow: true
        },
        creative: {
            colors: ['#EC4899', '#F59E0B', '#8B5CF6', '#10B981'],
            icons: [<Palette key="palette" />, <Sparkles key="sparkles" />, <Zap key="zap" />, <Code2 key="code" />],
            pattern: 'organic',
            glow: true
        },
        minimal: {
            colors: ['#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'],
            icons: [<Code2 key="code" />, <Cpu key="cpu" />],
            pattern: 'minimal',
            glow: false
        },
        cyber: {
            colors: ['#00FFFF', '#FF00FF', '#00FF9D', '#FF9900'],
            icons: [<Terminal key="term" />, <Zap key="zap" />, <Cpu key="cpu" />],
            pattern: 'grid',
            glow: true
        }
    };

    const currentTheme = themes[theme] || themes.tech;

    // Initialize canvas and animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let time = 0;

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        const createGradientMesh = (width, height, time) => {
            const gradient = ctx.createLinearGradient(0, 0, width, height);

            // Animate gradient colors based on time and mouse position
            const colorIndex = Math.floor(time * 0.001) % currentTheme.colors.length;
            const nextColorIndex = (colorIndex + 1) % currentTheme.colors.length;

            const lerpColor = (color1, color2, factor) => {
                const hex = (color) => color.replace('#', '');
                const r1 = parseInt(hex(color1).substring(0, 2), 16);
                const g1 = parseInt(hex(color1).substring(2, 4), 16);
                const b1 = parseInt(hex(color1).substring(4, 6), 16);
                const r2 = parseInt(hex(color2).substring(0, 2), 16);
                const g2 = parseInt(hex(color2).substring(2, 4), 16);
                const b2 = parseInt(hex(color2).substring(4, 6), 16);

                const r = Math.floor(r1 + (r2 - r1) * factor);
                const g = Math.floor(g1 + (g2 - g1) * factor);
                const b = Math.floor(b1 + (b2 - b1) * factor);

                return `rgb(${r}, ${g}, ${b})`;
            };

            const factor = (time * 0.001 % 1);

            gradient.addColorStop(0, lerpColor(currentTheme.colors[colorIndex], currentTheme.colors[nextColorIndex], factor));
            gradient.addColorStop(0.33, lerpColor(currentTheme.colors[(colorIndex + 1) % 4], currentTheme.colors[(colorIndex + 2) % 4], factor));
            gradient.addColorStop(0.66, lerpColor(currentTheme.colors[(colorIndex + 2) % 4], currentTheme.colors[(colorIndex + 3) % 4], factor));
            gradient.addColorStop(1, lerpColor(currentTheme.colors[(colorIndex + 3) % 4], currentTheme.colors[colorIndex], factor));

            return gradient;
        };

        const drawMesh = () => {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            // Clear canvas with slight transparency for trail effect
            ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
            ctx.fillRect(0, 0, width, height);

            // Create animated gradient
            const gradient = createGradientMesh(width, height, time);

            // Draw mesh pattern
            const cellSize = 50;
            const offsetX = Math.sin(time * 0.0005) * 20;
            const offsetY = Math.cos(time * 0.0007) * 20;

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.6;

            // Vertical lines
            for (let x = 0; x <= width; x += cellSize) {
                ctx.beginPath();
                const wave = Math.sin(time * 0.001 + x * 0.01) * 10;
                ctx.moveTo(x + offsetX + wave, 0);
                ctx.bezierCurveTo(
                    x + offsetX + wave + 20, height * 0.3,
                    x + offsetX + wave - 20, height * 0.7,
                    x + offsetX + wave, height
                );
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y <= height; y += cellSize) {
                ctx.beginPath();
                const wave = Math.cos(time * 0.001 + y * 0.01) * 10;
                ctx.moveTo(0, y + offsetY + wave);
                ctx.bezierCurveTo(
                    width * 0.3, y + offsetY + wave + 20,
                    width * 0.7, y + offsetY + wave - 20,
                    width, y + offsetY + wave
                );
                ctx.stroke();
            }

            // Draw animated blobs at intersection points
            ctx.globalAlpha = 0.4;
            for (let x = 0; x <= width; x += cellSize * 2) {
                for (let y = 0; y <= height; y += cellSize * 2) {
                    const pulse = Math.sin(time * 0.002 + x * 0.01 + y * 0.01) * 5 + 8;
                    const blobX = x + offsetX + Math.sin(time * 0.001 + x) * 15;
                    const blobY = y + offsetY + Math.cos(time * 0.001 + y) * 15;

                    ctx.beginPath();
                    ctx.arc(blobX, blobY, pulse, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }
            }

            // Mouse interaction effect
            const mouseX = mousePosition.x * width;
            const mouseY = mousePosition.y * height;

            ctx.globalAlpha = 0.3;
            const mouseRadius = 150;
            const radialGradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, mouseRadius
            );
            radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            radialGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = radialGradient;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, mouseRadius, 0, Math.PI * 2);
            ctx.fill();

            time += 16; // Approximately 60fps
            animationId = requestAnimationFrame(drawMesh);
        };

        const init = () => {
            resizeCanvas();
            drawMesh();
            setIsLoaded(true);
        };

        init();

        window.addEventListener('resize', () => {
            resizeCanvas();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [currentTheme.colors, mousePosition]);

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

    // Handle mouse movement
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
    };

    // Floating particles
    const [particles, setParticles] = useState([]);
    useEffect(() => {
        const newParticles = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.2,
            color: currentTheme.colors[i % currentTheme.colors.length],
            opacity: Math.random() * 0.5 + 0.3,
        }));
        setParticles(newParticles);

        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                x: (p.x + p.speed) % 100,
                y: (p.y + p.speed * 0.5) % 100,
                opacity: 0.3 + Math.sin(Date.now() * 0.001 + p.id) * 0.2,
            })));
        }, 100);

        return () => clearInterval(interval);
    }, [currentTheme.colors]);

    // Calculate parallax offsets based on scroll and mouse
    const parallaxX = mousePosition.x * 20 - 10;
    const parallaxY = mousePosition.y * 20 - 10 + scrollProgress * 50;

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950"
            onMouseMove={handleMouseMove}
        >
            {/* Animated Canvas Background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />

            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            opacity: particle.opacity,
                            filter: `blur(${particle.size * 0.5}px)`,
                            animation: `float ${3 + particle.id * 0.2}s ease-in-out infinite`,
                            animationDelay: `${particle.id * 0.1}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl w-full">
                    <motion.div
                        className="text-center space-y-6 md:space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
                        }}
                    >
                        {/* Theme Icons */}
                        <motion.div
                            className="flex justify-center gap-4 mb-8"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            {currentTheme.icons.map((icon, index) => (
                                <motion.div
                                    key={index}
                                    className="p-3 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                    style={{
                                        animation: `float-icon ${3 + index * 0.5}s ease-in-out infinite`,
                                    }}
                                >
                                    <div className="text-2xl" style={{ color: currentTheme.colors[index % currentTheme.colors.length] }}>
                                        {icon}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Name with Gradient Text */}
                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
                                {name.split(' ').map((word, index) => (
                                    <motion.span
                                        key={index}
                                        className="inline-block mr-4 last:mr-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${currentTheme.colors[index % currentTheme.colors.length]}, ${currentTheme.colors[(index + 1) % currentTheme.colors.length]})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            textShadow: currentTheme.glow
                                                ? `0 0 20px ${currentTheme.colors[index % currentTheme.colors.length]}40, 0 0 40px ${currentTheme.colors[index % currentTheme.colors.length]}20`
                                                : 'none',
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </span>
                        </motion.h1>

                        {/* Title with Animated Underline */}
                        <motion.div
                            className="relative inline-block"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-300 mb-4">
                                {title}
                            </h2>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full overflow-hidden">
                                <div
                                    className="h-full w-full"
                                    style={{
                                        background: `linear-gradient(90deg, ${currentTheme.colors.join(', ')})`,
                                        animation: 'shimmer 2s infinite',
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.p
                            className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            {description}
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <button
                                onClick={onCTAClick}
                                className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                                style={{
                                    background: `linear-gradient(135deg, ${currentTheme.colors[0]}, ${currentTheme.colors[1]})`,
                                    boxShadow: `0 0 30px ${currentTheme.colors[0]}40, inset 0 0 20px ${currentTheme.colors[1]}20`,
                                }}
                            >
                                <span className="relative z-10 text-white flex items-center gap-3">
                                    {ctaText}
                                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </span>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </button>
                        </motion.div>

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <motion.div
                                className="flex justify-center gap-4 pt-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                {socialLinks.map((link, index) => (
                                    <motion.a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors duration-300"
                                        whileHover={{ y: -5, scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            borderColor: `${currentTheme.colors[index % currentTheme.colors.length]}40`,
                                        }}
                                    >
                                        <link.icon className="w-6 h-6" />
                                    </motion.a>
                                ))}
                            </motion.div>
                        )}

                        {/* Stats */}
                        {stats.length > 0 && (
                            <motion.div
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                            >
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-4 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 text-center"
                                        whileHover={{ scale: 1.05 }}
                                        style={{
                                            borderColor: `${currentTheme.colors[index % currentTheme.colors.length]}40`,
                                        }}
                                    >
                                        <div className="text-3xl font-bold mb-1" style={{ color: currentTheme.colors[index % currentTheme.colors.length] }}>
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-gray-400">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, repeat: Infinity, repeatType: "reverse", duration: 2 }}
                >
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <span className="text-sm">Scroll to explore</span>
                        <ArrowDown className="w-6 h-6 animate-bounce" />
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-20px) translateX(10px); }
                }
                
                @keyframes float-icon {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                
                .gradient-animate {
                    background-size: 200% 200%;
                    animation: gradient-shift 3s ease infinite;
                }
            `}</style>
        </div>
    );
};

// Demo Usage Component
export const HeroSectionDemo = () => {
    const socialLinks = [
        { url: "https://github.com", icon: ({ className }) => <i className={`${className} fab fa-github`} /> },
        { url: "https://linkedin.com", icon: ({ className }) => <i className={`${className} fab fa-linkedin`} /> },
        { url: "https://twitter.com", icon: ({ className }) => <i className={`${className} fab fa-twitter`} /> },
        { url: "https://dribbble.com", icon: ({ className }) => <i className={`${className} fab fa-dribbble`} /> },
    ];

    const stats = [
        { value: "50+", label: "Projects" },
        { value: "5y", label: "Experience" },
        { value: "100%", label: "Satisfaction" },
        { value: "24/7", label: "Available" },
    ];

    return (
        <div className="min-h-screen">
            <AnimatedMeshHero
                name="Alex Johnson"
                title="Creative Developer & UI/UX Designer"
                description="Transforming ideas into exceptional digital experiences. Specializing in modern web technologies, responsive design, and interactive interfaces."
                ctaText="View My Portfolio"
                onCTAClick={() => console.log('CTA clicked')}
                socialLinks={socialLinks}
                stats={stats}
                theme="creative"
            />

            {/* Demo content to show scroll effect */}
            <div className="py-32 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold text-center text-white">Scroll to see the parallax effect</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="h-48 rounded-xl mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                                <h3 className="text-xl font-bold text-white mb-2">Project {i}</h3>
                                <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimatedMeshHero;
