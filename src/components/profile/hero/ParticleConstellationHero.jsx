import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Cpu,
    Network,
    Binary,
    Satellite,
    Orbit,
    Globe,
    Terminal,
    Code2,
    Rocket,
    Navigation,
    Users,
} from 'lucide-react';

class Particle {
    constructor(ctx, width, height, options = {}) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        // Position
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        // Velocity
        this.vx = (Math.random() - 0.5) * (options.speed || 0.5);
        this.vy = (Math.random() - 0.5) * (options.speed || 0.5);

        // Size
        this.size = options.size || Math.random() * 2 + 1;
        this.baseSize = this.size;

        // Color
        this.color = options.color || this.getRandomColor();
        this.baseColor = this.color;

        // Glow
        this.glow = options.glow || false;
        this.glowIntensity = Math.random() * 0.5 + 0.5;

        // Connection
        this.connections = [];
        this.maxConnections = options.maxConnections || 5;
        this.connectionDistance = options.connectionDistance || 150;

        // Animation
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.02;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;

        // Orbit (for special particles)
        this.isOrbital = options.isOrbital || false;
        this.orbitRadius = options.orbitRadius || 0;
        this.orbitSpeed = options.orbitSpeed || 0;
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitCenter = options.orbitCenter || { x: width / 2, y: height / 2 };

        // Tracker
        this.isTracked = false;
        this.trackingProgress = 0;
    }

    getRandomColor() {
        const colors = [
            '#3B82F6', // Blue
            '#8B5CF6', // Purple
            '#06B6D4', // Cyan
            '#10B981', // Emerald
            '#EC4899', // Pink
            '#F59E0B', // Amber
            '#6366F1', // Indigo
            '#EF4444', // Red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(mouse, deltaTime) {
        // Handle orbital movement
        if (this.isOrbital) {
            this.orbitAngle += this.orbitSpeed * deltaTime;
            this.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius;
        } else {
            // Regular movement with boundary bounce
            this.x += this.vx * deltaTime * 60;
            this.y += this.vy * deltaTime * 60;

            // Bounce off walls
            if (this.x < 0 || this.x > this.width) this.vx *= -1;
            if (this.y < 0 || this.y > this.height) this.vy *= -1;

            // Keep within bounds
            this.x = Math.max(0, Math.min(this.width, this.x));
            this.y = Math.max(0, Math.min(this.height, this.y));
        }

        // Mouse interaction
        if (mouse.active) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const force = (150 - distance) / 150;
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * force * 2;
                this.y += Math.sin(angle) * force * 2;

                // Size pulse near mouse
                this.size = this.baseSize * (1 + force * 0.5);
            } else {
                this.size = this.baseSize;
            }
        }

        // Pulsing animation
        this.pulse += this.pulseSpeed * deltaTime * 60;
        this.angle += this.angleSpeed * deltaTime * 60;

        // Reset connections
        this.connections = [];
    }

    draw() {
        // Draw glow effect
        if (this.glow) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            const glowGradient = this.ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 3
            );
            glowGradient.addColorStop(0, `${this.color}${Math.floor(this.glowIntensity * 50).toString(16).padStart(2, '0')}`);
            glowGradient.addColorStop(1, `${this.color}00`);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();
        }

        // Draw particle
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.angle);

        // Draw particle shape (could be circle, triangle, square, etc.)
        this.ctx.beginPath();

        // Random shape based on size
        if (this.size > 3) {
            // Hexagon for larger particles
            const sides = 6;
            this.ctx.moveTo(this.size, 0);
            for (let i = 1; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides;
                this.ctx.lineTo(
                    Math.cos(angle) * this.size,
                    Math.sin(angle) * this.size
                );
            }
            this.ctx.closePath();
        } else {
            // Circle for smaller particles
            this.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        }

        // Fill with gradient
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `${this.color}FF`);
        gradient.addColorStop(1, `${this.color}88`);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Add sparkle effect
        const sparkleSize = this.size * 0.3;
        const sparkleAngle = this.pulse;
        this.ctx.beginPath();
        this.ctx.arc(
            Math.cos(sparkleAngle) * this.size * 0.7,
            Math.sin(sparkleAngle) * this.size * 0.7,
            sparkleSize,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();

        this.ctx.restore();
    }

    drawConnection(otherParticle) {
        const dx = otherParticle.x - this.x;
        const dy = otherParticle.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
            // Calculate connection strength (closer = stronger)
            const strength = 1 - (distance / this.connectionDistance);

            // Create gradient for connection line
            const gradient = this.ctx.createLinearGradient(
                this.x, this.y,
                otherParticle.x, otherParticle.y
            );
            gradient.addColorStop(0, `${this.color}${Math.floor(strength * 50).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${otherParticle.color}${Math.floor(strength * 50).toString(16).padStart(2, '0')}`);

            // Draw connection line
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(otherParticle.x, otherParticle.y);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = strength * 2;
            this.ctx.globalAlpha = strength * 0.6;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;

            // Draw midpoint spark
            if (strength > 0.7) {
                const midX = (this.x + otherParticle.x) / 2;
                const midY = (this.y + otherParticle.y) / 2;

                this.ctx.beginPath();
                this.ctx.arc(midX, midY, strength * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fill();
            }
        }
    }
}

const ParticleConstellationHero = ({
    name = "Alex Chen",
    title = "Full Stack Developer",
    description = "Building connections in the digital universe. Crafting elegant solutions through code and design.",
    ctaText = "Explore My Universe",
    onCTAClick,
    stats = [],
    showControlPanel = true,
    particleCount = 150,
    theme = 'tech' // 'tech', 'cyber', 'cosmic', 'neon'
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const particlesRef = useRef([]);
    const animationRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });
    const lastTimeRef = useRef(0);

    const [activeConnections, setActiveConnections] = useState(0);
    const [particleCountState, setParticleCount] = useState(particleCount);
    const [isPlaying, setIsPlaying] = useState(true);
    const [selectedStats, setSelectedStats] = useState(stats);

    // Theme configurations
    const themes = {
        tech: {
            colors: ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981'],
            backgroundColor: '#0A0A0A',
            icon: <Cpu className="w-6 h-6" />,
            particleTypes: ['tech', 'data', 'network']
        },
        cyber: {
            colors: ['#00FFFF', '#FF00FF', '#00FF9D', '#FF9900'],
            backgroundColor: '#000814',
            icon: <Binary className="w-6 h-6" />,
            particleTypes: ['cyber', 'code', 'hacker']
        },
        cosmic: {
            colors: ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'],
            backgroundColor: '#05051E',
            icon: <Orbit className="w-6 h-6" />,
            particleTypes: ['star', 'planet', 'comet']
        },
        neon: {
            colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00'],
            backgroundColor: '#110011',
            icon: <Sparkles className="w-6 h-6" />,
            particleTypes: ['neon', 'glow', 'pulse']
        }
    };

    const currentTheme = themes[theme] || themes.tech;

    // Initialize particles
    const initParticles = useCallback((count) => {
        const canvas = canvasRef.current;
        if (!canvas) return [];

        const ctx = canvas.getContext('2d');
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        const particles = [];
        const centerX = width / 2;
        const centerY = height / 2;

        // Create special orbital particles
        for (let i = 0; i < 8; i++) {
            const radius = Math.min(width, height) * 0.3;

            particles.push(new Particle(ctx, width, height, {
                isOrbital: true,
                orbitRadius: radius,
                orbitSpeed: 0.002 + Math.random() * 0.003,
                orbitCenter: { x: centerX, y: centerY },
                size: 4 + Math.random() * 3,
                color: currentTheme.colors[i % currentTheme.colors.length],
                glow: true,
                connectionDistance: 200,
                maxConnections: 8
            }));
        }

        // Create regular particles
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(ctx, width, height, {
                speed: 0.2 + Math.random() * 0.3,
                size: 1 + Math.random() * 3,
                color: currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)],
                glow: Math.random() > 0.7,
                connectionDistance: 120 + Math.random() * 80,
                maxConnections: 3 + Math.floor(Math.random() * 4)
            }));
        }

        return particles;
    }, [currentTheme.colors]);

    // Animation loop
    const animate = useCallback((time) => {
        if (!isPlaying) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        // Clear with fade effect for trails
        ctx.fillStyle = `${currentTheme.backgroundColor}08`;
        ctx.fillRect(0, 0, width, height);

        // Calculate delta time for smooth animation
        const deltaTime = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        // Update and draw particles
        let connectionCount = 0;
        const particles = particlesRef.current;

        // Update particles
        particles.forEach(particle => {
            particle.update(mouseRef.current, deltaTime);
        });

        // Find and draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                if (particles[i].connections.length < particles[i].maxConnections &&
                    particles[j].connections.length < particles[j].maxConnections) {

                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < particles[i].connectionDistance) {
                        particles[i].connections.push(particles[j]);
                        particles[j].connections.push(particles[i]);
                        particles[i].drawConnection(particles[j]);
                        connectionCount++;
                    }
                }
            }
        }

        // Draw particles after connections (so they appear on top)
        particles.forEach(particle => {
            particle.draw();
        });

        // Update connection count with smoothing
        setActiveConnections(prev => Math.floor(prev * 0.9 + connectionCount * 0.1));

        animationRef.current = requestAnimationFrame(animate);
    }, [isPlaying, currentTheme.backgroundColor]);

    // Handle mouse interaction
    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        mouseRef.current = {
            x: (e.clientX - rect.left) * (canvas.width / (rect.width * dpr)),
            y: (e.clientY - rect.top) * (canvas.height / (rect.height * dpr)),
            active: true
        };
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current.active = false;
    }, []);

    // Handle touch interaction
    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        if (!containerRef.current || e.touches.length === 0) return;

        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        mouseRef.current = {
            x: (touch.clientX - rect.left) * (canvas.width / (rect.width * dpr)),
            y: (touch.clientY - rect.top) * (canvas.height / (rect.height * dpr)),
            active: true
        };
    }, []);

    // Initialize and resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            // Reinitialize particles on resize
            particlesRef.current = initParticles(particleCountState);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Start animation
        lastTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate, initParticles, particleCountState]);

    // Stats with animations
    useEffect(() => {
        if (stats.length === 0) {
            const defaultStats = [
                { icon: <Code2 />, value: '100K+', label: 'Lines of Code', color: currentTheme.colors[0] },
                { icon: <Network />, value: activeConnections.toString(), label: 'Active Connections', color: currentTheme.colors[1] },
                { icon: <Rocket />, value: '50+', label: 'Projects', color: currentTheme.colors[2] },
                { icon: <Users />, value: '100%', label: 'Satisfaction', color: currentTheme.colors[3] },
            ];
            setSelectedStats(defaultStats);
        }
    }, [stats, activeConnections, currentTheme.colors]);

    // Particle controls
    const addParticles = () => {
        const newCount = Math.min(500, particleCountState + 50);
        setParticleCount(newCount);
        particlesRef.current = initParticles(newCount);
    };

    const removeParticles = () => {
        const newCount = Math.max(50, particleCountState - 50);
        setParticleCount(newCount);
        particlesRef.current = initParticles(newCount);
    };

    const clearConnections = () => {
        particlesRef.current.forEach(particle => {
            particle.connections = [];
        });
    };

    const explodeParticles = () => {
        particlesRef.current.forEach(particle => {
            particle.vx = (Math.random() - 0.5) * 10;
            particle.vy = (Math.random() - 0.5) * 10;
        });
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen overflow-hidden"
            style={{ backgroundColor: currentTheme.backgroundColor }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseLeave}
        >
            {/* Canvas for particles */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl w-full">
                    {/* Constellation Center - Profile Info */}
                    <motion.div
                        className="relative mb-12"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                    >
                        {/* Animated Orbital Rings */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {[0, 1, 2].map((ring) => (
                                <motion.div
                                    key={ring}
                                    className="absolute rounded-full border"
                                    style={{
                                        width: `${200 + ring * 100}px`,
                                        height: `${200 + ring * 100}px`,
                                        borderColor: `${currentTheme.colors[ring]}20`,
                                        borderWidth: '1px',
                                    }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20 + ring * 10, repeat: Infinity, ease: "linear" }}
                                />
                            ))}
                        </div>

                        {/* Central Profile Circle */}
                        <div className="relative w-48 h-48 mx-auto mb-8">
                            {/* Outer Glow */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: `radial-gradient(circle, ${currentTheme.colors[0]}20 0%, transparent 70%)`,
                                    filter: 'blur(20px)',
                                }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />

                            {/* Main Circle */}
                            <div className="absolute inset-4 rounded-full backdrop-blur-xl bg-black/40 border-2 border-white/10 flex flex-col items-center justify-center">
                                {/* Animated Icons Orbit */}
                                <div className="absolute -inset-8">
                                    {currentTheme.colors.map((color, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="absolute w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{
                                                left: '50%',
                                                top: '50%',
                                                background: `${color}20`,
                                                border: `1px solid ${color}40`,
                                            }}
                                            animate={{
                                                x: Math.cos((idx / currentTheme.colors.length) * Math.PI * 2) * 80 - 16,
                                                y: Math.sin((idx / currentTheme.colors.length) * Math.PI * 2) * 80 - 16,
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: idx * 0.2,
                                                type: "spring",
                                                stiffness: 100
                                            }}
                                        >
                                            <div style={{ color }}>
                                                {currentTheme.icon}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Name Initials or Avatar */}
                                <motion.div
                                    className="text-5xl font-bold mb-2"
                                    style={{
                                        background: `linear-gradient(135deg, ${currentTheme.colors.join(', ')})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                                    transition={{ duration: 5, repeat: Infinity }}
                                >
                                    {name.split(' ').map(n => n[0]).join('')}
                                </motion.div>
                                <div className="text-sm text-gray-400">Network Node</div>
                            </div>
                        </div>

                        {/* Name and Title */}
                        <div className="text-center space-y-4">
                            <motion.h1
                                className="text-5xl sm:text-6xl md:text-7xl font-bold"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
                                    {name}
                                </span>
                            </motion.h1>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-2xl sm:text-3xl text-gray-300 mb-2">
                                    {title}
                                </h2>
                                <div className="h-1 w-32 mx-auto rounded-full overflow-hidden">
                                    <div
                                        className="h-full"
                                        style={{
                                            background: `linear-gradient(90deg, ${currentTheme.colors.join(', ')})`,
                                            animation: 'shimmer 2s infinite',
                                        }}
                                    />
                                </div>
                            </motion.div>

                            <motion.p
                                className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {description}
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {selectedStats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="p-4 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 text-center"
                                whileHover={{ y: -5, scale: 1.05 }}
                                style={{ borderColor: `${stat.color}40` }}
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                                        <div style={{ color: stat.color }}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        className="text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <button
                            onClick={onCTAClick}
                            className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                            style={{
                                background: `linear-gradient(135deg, ${currentTheme.colors[0]}, ${currentTheme.colors[1]})`,
                                boxShadow: `0 0 40px ${currentTheme.colors[0]}40`,
                            }}
                        >
                            <span className="relative z-10 text-white flex items-center gap-3">
                                {ctaText}
                                <Satellite className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            </span>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <span className="text-sm">Scroll to explore network</span>
                        <Navigation className="w-6 h-6" />
                    </div>
                </motion.div>
            </div>

            {/* Control Panel */}
            {showControlPanel && (
                <motion.div
                    className="absolute bottom-4 left-4 z-20"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <div className="p-4 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal className="w-5 h-5 text-gray-400" />
                            <h3 className="text-sm font-semibold text-gray-300">Particle Controls</h3>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="ml-auto px-3 py-1 rounded-lg text-xs font-medium"
                                style={{
                                    backgroundColor: isPlaying ? `${currentTheme.colors[0]}20` : '#EF444420',
                                    color: isPlaying ? currentTheme.colors[0] : '#EF4444',
                                    border: `1px solid ${isPlaying ? `${currentTheme.colors[0]}40` : '#EF444440'}`
                                }}
                            >
                                {isPlaying ? 'Pause' : 'Play'}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Particles: {particleCountState}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={removeParticles}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                                        style={{
                                            backgroundColor: `${currentTheme.colors[0]}20`,
                                            color: currentTheme.colors[0],
                                            border: `1px solid ${currentTheme.colors[0]}40`
                                        }}
                                    >
                                        -
                                    </button>
                                    <button
                                        onClick={addParticles}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                                        style={{
                                            backgroundColor: `${currentTheme.colors[1]}20`,
                                            color: currentTheme.colors[1],
                                            border: `1px solid ${currentTheme.colors[1]}40`
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={clearConnections}
                                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium"
                                    style={{
                                        backgroundColor: `${currentTheme.colors[2]}20`,
                                        color: currentTheme.colors[2],
                                        border: `1px solid ${currentTheme.colors[2]}40`
                                    }}
                                >
                                    Clear Links
                                </button>
                                <button
                                    onClick={explodeParticles}
                                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium"
                                    style={{
                                        backgroundColor: `${currentTheme.colors[3]}20`,
                                        color: currentTheme.colors[3],
                                        border: `1px solid ${currentTheme.colors[3]}40`
                                    }}
                                >
                                    Explode
                                </button>
                            </div>

                            <div className="pt-2 border-t border-white/10">
                                <div className="text-xs text-gray-400 mb-2">Active Connections: {activeConnections}</div>
                                <div className="h-1 rounded-full overflow-hidden">
                                    <div
                                        className="h-full"
                                        style={{
                                            width: `${Math.min(100, (activeConnections / 500) * 100)}%`,
                                            background: `linear-gradient(90deg, ${currentTheme.colors.join(', ')})`,
                                            transition: 'width 0.3s ease'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Interaction Mode Indicator */}
            <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-xl bg-black/40 border border-white/10">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-300">Move mouse to interact</span>
                </div>
            </div>

            {/* Theme Particles Floating Around */}
            <AnimatePresence>
                {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width: '4px',
                            height: '4px',
                            backgroundColor: currentTheme.colors[i % currentTheme.colors.length],
                            filter: 'blur(1px)',
                            left: `${10 + i * 20}%`,
                            top: '20%',
                        }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.sin(i) * 50, 0],
                            opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </AnimatePresence>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default ParticleConstellationHero;
