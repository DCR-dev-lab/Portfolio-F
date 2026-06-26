import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Terminal,
    Code2,
    Server,
    Cloud,
    Zap,
    Play,
    Pause,
    RotateCcw,
    Github,
    Linkedin,
    Twitter,
    Globe,
    Coffee,
    Sparkles,
    Command,
    ChevronRight,
    FileCode,
    Bug,
    Wifi,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';

const TerminalHero = ({
    // Personal Info
    name = "alex@developer",
    title = "Senior Full Stack Engineer",
    description = "Crafting robust, scalable applications with modern technologies. Passionate about clean code, devops, and open-source contributions.",
    
    // Terminal Configuration
    theme = "matrix", // 'matrix', 'hacker', 'modern', 'cyberpunk', 'minimal'
    typingSpeed = 50, // ms per character
    cursorBlinkSpeed = 500, // ms
    showTypingAnimation = true,
    autoPlay = true,
    loop = true,
    
    // Commands Sequence
    commands = [
        { cmd: "whoami", response: "alex@developer ~ Senior Full Stack Engineer", delay: 1000 },
        { cmd: "pwd", response: "/home/alex/projects", delay: 800 },
        { cmd: "ls -la", response: ["📁 backend/", "📁 frontend/", "📁 devops/", "📁 open-source/"], delay: 600 },
        { cmd: "cat skills.txt", response: "React • Node.js • TypeScript • Python • AWS • Docker • Kubernetes • PostgreSQL • GraphQL", delay: 1200 },
        { cmd: "git status", response: "On branch main\nYour branch is up to date with 'origin/main'.\nNothing to commit, working tree clean", delay: 900 },
        { cmd: "uptime", response: "System up for 5+ years of professional experience", delay: 700 },
        { cmd: "ping portfolio", response: "64 bytes from portfolio: icmp_seq=0 ttl=64 time=0.420 ms\nPortfolio is reachable and responsive!", delay: 1100 },
        { cmd: "connect", response: "Establishing connection to potential opportunities...", delay: 1500 },
    ],
    
    // CTA Configuration
    primaryCTA = {
        text: "ssh connect@portfolio",
        icon: <Terminal className="w-5 h-5" />,
        onClick: () => console.log('Connect clicked'),
        color: "#10B981"
    },
    secondaryCTA = {
        text: "cat resume.txt",
        icon: <FileCode className="w-5 h-5" />,
        onClick: () => console.log('Resume downloaded'),
        color: "#3B82F6"
    },
    
    // Social Links
    socialLinks = [
        { platform: "github", url: "https://github.com", icon: <Github className="w-5 h-5" />, command: "open https://github.com" },
        { platform: "linkedin", url: "https://linkedin.com", icon: <Linkedin className="w-5 h-5" />, command: "open https://linkedin.com" },
        { platform: "twitter", url: "https://twitter.com", icon: <Twitter className="w-5 h-5" />, command: "open https://twitter.com" },
        { platform: "website", url: "https://portfolio.com", icon: <Globe className="w-5 h-5" />, command: "open https://portfolio.com" },
    ],
    
    // Stats
    stats = [
        { icon: <Code2 className="w-4 h-4" />, value: "500K+", label: "Lines Written", color: "#3B82F6" },
        { icon: <Server className="w-4 h-4" />, value: "50+", label: "Projects", color: "#8B5CF6" },
        { icon: <Cloud className="w-4 h-4" />, value: "99.9%", label: "Uptime", color: "#06B6D4" },
        { icon: <Bug className="w-4 h-4" />, value: "∞", label: "Bugs Squashed", color: "#10B981" },
    ],
    
    // Advanced Options
    showTerminalHeader = true,
    showInputLine = true,
    interactive = true,
    matrixRain = false,
    
    // Additional Info
    availability = "🟢 Available for opportunities",
    status = "🚀 Currently building something awesome"
}) => {
    const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(autoPlay);
    const [isComplete, setIsComplete] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [terminalHistory, setTerminalHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [inputHistory, setInputHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showMatrix, setShowMatrix] = useState(matrixRain);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    
    const terminalRef = useRef(null);
    const inputRef = useRef(null);
    const cursorRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const cursorIntervalRef = useRef(null);
    const matrixIntervalRef = useRef(null);
    
    // Theme configurations
    const themes = {
        matrix: {
            bg: 'bg-black',
            text: 'text-green-400',
            prompt: 'text-green-500',
            cursor: 'bg-green-500',
            border: 'border-green-800',
            header: 'bg-green-900/30',
            accent: '#10B981',
            glow: true,
            font: 'font-mono'
        },
        hacker: {
            bg: 'bg-gray-900',
            text: 'text-cyan-400',
            prompt: 'text-cyan-500',
            cursor: 'bg-cyan-500',
            border: 'border-cyan-800',
            header: 'bg-cyan-900/30',
            accent: '#06B6D4',
            glow: true,
            font: 'font-mono'
        },
        modern: {
            bg: 'bg-slate-950',
            text: 'text-blue-300',
            prompt: 'text-blue-400',
            cursor: 'bg-blue-400',
            border: 'border-blue-800',
            header: 'bg-blue-900/30',
            accent: '#3B82F6',
            glow: false,
            font: 'font-mono'
        },
        cyberpunk: {
            bg: 'bg-gray-950',
            text: 'text-pink-400',
            prompt: 'text-purple-400',
            cursor: 'bg-purple-500',
            border: 'border-purple-800',
            header: 'bg-purple-900/30',
            accent: '#EC4899',
            glow: true,
            font: 'font-mono'
        },
        minimal: {
            bg: 'bg-gray-900',
            text: 'text-gray-300',
            prompt: 'text-gray-400',
            cursor: 'bg-gray-400',
            border: 'border-gray-800',
            header: 'bg-gray-800/30',
            accent: '#6B7280',
            glow: false,
            font: 'font-mono'
        }
    };
    
    const currentTheme = themes[theme] || themes.matrix;

    // Initialize typing animation
    useEffect(() => {
        if (!showTypingAnimation || !isTyping || isComplete) return;
        
        const currentCommand = commands[currentCommandIndex];
        if (!currentCommand) return;
        
        let charIndex = 0;
        let currentText = '';
        
        const typeCharacter = () => {
            if (charIndex < currentCommand.cmd.length) {
                currentText += currentCommand.cmd.charAt(charIndex);
                setDisplayedText(currentText);
                charIndex++;
                typingTimeoutRef.current = setTimeout(typeCharacter, typingSpeed);
            } else {
                // Command typed, show response after delay
                setTimeout(() => {
                    // Add command to history
                    setTerminalHistory(prev => [...prev, {
                        type: 'command',
                        content: currentCommand.cmd,
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    
                    // Show response
                    setTimeout(() => {
                        const response = Array.isArray(currentCommand.response) 
                            ? currentCommand.response.join('\n')
                            : currentCommand.response;
                            
                        setTerminalHistory(prev => [...prev, {
                            type: 'response',
                            content: response,
                            timestamp: new Date().toLocaleTimeString()
                        }]);
                        
                        // Move to next command or complete
                        setTimeout(() => {
                            if (currentCommandIndex < commands.length - 1) {
                                setCurrentCommandIndex(prev => prev + 1);
                                setDisplayedText('');
                            } else {
                                setIsComplete(true);
                                if (loop) {
                                    setTimeout(() => {
                                        setCurrentCommandIndex(0);
                                        setTerminalHistory([]);
                                        setDisplayedText('');
                                        setIsComplete(false);
                                    }, 3000);
                                }
                            }
                        }, 500);
                    }, currentCommand.delay || 1000);
                }, 500);
            }
        };
        
        typingTimeoutRef.current = setTimeout(typeCharacter, typingSpeed);
        
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [currentCommandIndex, isTyping, isComplete, commands, showTypingAnimation, typingSpeed, loop]);

    // Cursor blinking effect
    useEffect(() => {
        cursorIntervalRef.current = setInterval(() => {
            setShowCursor(prev => !prev);
        }, cursorBlinkSpeed);
        
        return () => {
            if (cursorIntervalRef.current) {
                clearInterval(cursorIntervalRef.current);
            }
        };
    }, [cursorBlinkSpeed]);

    // Matrix rain effect
    useEffect(() => {
        if (!showMatrix) return;
        
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Set canvas to cover entire screen
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;
        
        const fontSize = 14;
        const columns = Math.floor(rect.width / fontSize);
        const drops = Array(columns).fill(1);
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = currentTheme.accent;
            ctx.font = `${fontSize}px monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = alphabet[Math.floor(Math.random() * alphabet.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                
                ctx.fillText(text, x, y);
                
                if (y > rect.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        
        matrixIntervalRef.current = setInterval(draw, 50);
        
        return () => {
            if (matrixIntervalRef.current) {
                clearInterval(matrixIntervalRef.current);
            }
        };
    }, [showMatrix, currentTheme.accent]);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalHistory]);

    // Focus input on click
    const focusInput = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Handle user input
    const handleInput = (e) => {
        if (e.key === 'Enter' && userInput.trim()) {
            // Add command to history
            setTerminalHistory(prev => [...prev, {
                type: 'command',
                content: userInput,
                timestamp: new Date().toLocaleTimeString()
            }]);
            
            // Process command
            processCommand(userInput.trim().toLowerCase());
            
            // Add to input history
            setInputHistory(prev => [userInput, ...prev]);
            setUserInput('');
            setHistoryIndex(-1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (inputHistory.length > 0) {
                const newIndex = historyIndex < inputHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                setUserInput(inputHistory[newIndex] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setUserInput(inputHistory[newIndex] || '');
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setUserInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Simple auto-complete
            const commonCommands = ['help', 'clear', 'whoami', 'contact', 'projects', 'skills', 'resume', 'social', 'theme'];
            const matching = commonCommands.filter(cmd => cmd.startsWith(userInput));
            if (matching.length === 1) {
                setUserInput(matching[0] + ' ');
            }
        }
    };

    // Process user commands
    const processCommand = (cmd) => {
        let response = '';
        
        switch (cmd) {
            case 'help':
                response = 'Available commands:\n' +
                          'help - Show this help message\n' +
                          'clear - Clear terminal\n' +
                          'whoami - Display user info\n' +
                          'contact - Show contact info\n' +
                          'projects - List projects\n' +
                          'skills - Show technical skills\n' +
                          'resume - Download resume\n' +
                          'social - Show social links\n' +
                          'theme [name] - Change theme\n' +
                          'matrix [on/off] - Toggle matrix rain\n' +
                          'auth - Authentication required';
                break;
                
            case 'clear':
                setTerminalHistory([]);
                return;
                
            case 'whoami':
                response = `${name} ~ ${title}\n${description}`;
                break;
                
            case 'contact':
                response = '📧 hello@alex.dev\n📱 +1 (555) 123-4567\n🌐 https://portfolio.com';
                break;
                
            case 'projects':
                response = '🚀 E-commerce Platform (React, Node.js, MongoDB)\n' +
                          '🤖 AI Chatbot (Python, TensorFlow, FastAPI)\n' +
                          '📊 Analytics Dashboard (Vue.js, D3.js, PostgreSQL)\n' +
                          '🔐 Auth System (Next.js, NextAuth, Redis)';
                break;
                
            case 'skills':
                response = 'Frontend: React, Vue.js, TypeScript, Next.js\n' +
                          'Backend: Node.js, Python, Go, GraphQL\n' +
                          'DevOps: Docker, Kubernetes, AWS, GitHub Actions\n' +
                          'Databases: PostgreSQL, MongoDB, Redis, Elasticsearch';
                break;
                
            case 'resume':
                response = '📄 Downloading resume.pdf...\n✅ Resume downloaded successfully!';
                secondaryCTA.onClick();
                break;
                
            case 'social':
                response = 'GitHub: https://github.com\n' +
                          'LinkedIn: https://linkedin.com\n' +
                          'Twitter: https://twitter.com\n' +
                          'Website: https://portfolio.com';
                break;
                
            case 'auth':
                response = '🔐 Authentication required. Type your password:';
                setShowPassword(true);
                break;
                
            case 'sudo rm -rf /':
                response = '😱 WARNING: Dangerous command detected!\n' +
                          'This would delete everything. Command rejected.';
                break;
                
            default:
                if (cmd.startsWith('theme ')) {
                    const newTheme = cmd.split(' ')[1];
                    if (Object.keys(themes).includes(newTheme)) {
                        response = `Switching to ${newTheme} theme...`;
                        // In a real app, you would change the theme here
                    } else {
                        response = `Unknown theme: ${newTheme}\nAvailable themes: ${Object.keys(themes).join(', ')}`;
                    }
                } else if (cmd.startsWith('matrix ')) {
                    const action = cmd.split(' ')[1];
                    if (action === 'on') {
                        setShowMatrix(true);
                        response = 'Matrix rain activated 🌧️';
                    } else if (action === 'off') {
                        setShowMatrix(false);
                        response = 'Matrix rain deactivated ☀️';
                    }
                } else {
                    response = `Command not found: ${cmd}\nType 'help' for available commands`;
                }
        }
        
        // Add response to terminal history
        setTimeout(() => {
            setTerminalHistory(prev => [...prev, {
                type: 'response',
                content: response,
                timestamp: new Date().toLocaleTimeString()
            }]);
        }, 500);
    };

    // Handle authentication
    const handleAuth = () => {
        if (password === 'developer') {
            setIsAuthenticated(true);
            setShowPassword(false);
            setPassword('');
            setTerminalHistory(prev => [...prev, {
                type: 'response',
                content: '✅ Authentication successful!\nWelcome to the admin panel.',
                timestamp: new Date().toLocaleTimeString()
            }]);
        } else {
            setTerminalHistory(prev => [...prev, {
                type: 'response',
                content: '❌ Authentication failed. Try again.',
                timestamp: new Date().toLocaleTimeString()
            }]);
        }
    };

    // Control functions
    const toggleTyping = () => {
        setIsTyping(!isTyping);
        if (!isTyping && isComplete) {
            setCurrentCommandIndex(0);
            setTerminalHistory([]);
            setDisplayedText('');
            setIsComplete(false);
        }
    };

    const resetTerminal = () => {
        setCurrentCommandIndex(0);
        setTerminalHistory([]);
        setDisplayedText('');
        setIsComplete(false);
        setIsTyping(autoPlay);
        setUserInput('');
        setInputHistory([]);
        setHistoryIndex(-1);
        setIsAuthenticated(false);
        setShowPassword(false);
        setPassword('');
    };

    const skipAnimation = () => {
        setCurrentCommandIndex(commands.length - 1);
        setTerminalHistory(commands.map((cmd) => [
            { type: 'command', content: cmd.cmd, timestamp: new Date().toLocaleTimeString() },
            { type: 'response', content: Array.isArray(cmd.response) ? cmd.response.join('\n') : cmd.response, timestamp: new Date().toLocaleTimeString() }
        ]).flat());
        setIsComplete(true);
    };

    return (
        <div 
            className={`relative min-h-screen overflow-hidden ${currentTheme.bg} ${currentTheme.font}`}
            onClick={focusInput}
        >
            {/* Matrix Rain Background */}
            {showMatrix && (
                <canvas
                    id="matrix-canvas"
                    className="absolute inset-0 z-0"
                />
            )}

            {/* Noise/Scanlines Overlay */}
            <div className="absolute inset-0 z-1 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            </div>

            {/* Main Terminal Container */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="w-full max-w-6xl">
                    {/* Terminal Window */}
                    <motion.div 
                        className={`rounded-xl border-2 ${currentTheme.border} overflow-hidden shadow-2xl`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            boxShadow: currentTheme.glow ? `0 0 40px ${currentTheme.accent}40` : 'none'
                        }}
                    >
                        {/* Terminal Header */}
                        {showTerminalHeader && (
                            <div className={`flex items-center justify-between px-4 py-3 ${currentTheme.header} border-b ${currentTheme.border}`}>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className={`flex items-center gap-2 ${currentTheme.text} text-sm`}>
                                        <Terminal className="w-4 h-4" />
                                        <span>terminal@{name}</span>
                                        <ChevronRight className="w-4 h-4" />
                                        <span>portfolio</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                                        <Wifi className="w-3 h-3" />
                                        <span>ssh://portfolio:22</span>
                                    </div>
                                    {isAuthenticated && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-900/30 text-green-400 text-xs">
                                            <Lock className="w-3 h-3" />
                                            <span>ROOT</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Terminal Body */}
                        <div 
                            ref={terminalRef}
                            className={`${currentTheme.bg} p-4 sm:p-6 h-[60vh] sm:h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent`}
                        >
                            {/* Welcome Banner */}
                            <div className={`${currentTheme.text} mb-6`}>
                                <pre className="text-sm sm:text-base">
{`╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   █████╗ ██╗     ███████╗██╗  ██╗    ██████╗ ███████╗██╗     ║
║  ██╔══██╗██║     ██╔════╝╚██╗██╔╝    ██╔══██╗██╔════╝██║     ║
║  ███████║██║     █████╗   ╚███╔╝     ██║  ██║█████╗  ██║     ║
║  ██╔══██║██║     ██╔══╝   ██╔██╗     ██║  ██║██╔══╝  ╚██╗    ║
║  ██║  ██║███████╗███████╗██╔╝ ██╗    ██████╔╝███████╗ ╚████║ ║
║  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝    ╚═════╝ ╚══════╝  ╚═══╝ ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`}
                                </pre>
                                <div className="mt-4 text-sm text-gray-500">
                                    Welcome to {name}'s interactive portfolio. Type 'help' for commands.
                                </div>
                            </div>

                            {/* Terminal History */}
                            <div className="space-y-3">
                                {terminalHistory.map((entry, index) => (
                                    <div key={index} className="space-y-1">
                                        {entry.type === 'command' ? (
                                            <div className="flex items-start gap-2">
                                                <span className={`${currentTheme.prompt} font-bold`}>
                                                    <span className="opacity-70">$</span> {entry.content}
                                                </span>
                                                <span className="text-xs text-gray-600 mt-1">{entry.timestamp}</span>
                                            </div>
                                        ) : (
                                            <pre className={`${currentTheme.text} whitespace-pre-wrap text-sm sm:text-base ml-4`}>
                                                {entry.content}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Current Typing Animation */}
                                {isTyping && !isComplete && (
                                    <div className="flex items-center gap-2">
                                        <span className={`${currentTheme.prompt} font-bold`}>
                                            <span className="opacity-70">$</span> {displayedText}
                                            {showCursor && (
                                                <span 
                                                    ref={cursorRef}
                                                    className={`ml-1 ${currentTheme.cursor} w-3 h-5 inline-block`}
                                                    style={{ animation: 'blink 1s infinite' }}
                                                />
                                            )}
                                        </span>
                                    </div>
                                )}
                                
                                {/* Authentication Prompt */}
                                {showPassword && (
                                    <div className="flex items-center gap-2">
                                        <span className={`${currentTheme.prompt} font-bold`}>
                                            <span className="opacity-70">$</span> Password:
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                                                className={`${currentTheme.bg} ${currentTheme.text} border-none outline-none w-32`}
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-gray-500 hover:text-gray-300"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={handleAuth}
                                                className="px-3 py-1 bg-green-700 text-white text-sm rounded"
                                            >
                                                Enter
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {/* User Input Line */}
                                {showInputLine && interactive && (
                                    <div className="flex items-center gap-2 mt-4">
                                        <span className={`${currentTheme.prompt} font-bold`}>
                                            <span className="opacity-70">$</span>
                                        </span>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyDown={handleInput}
                                            className={`flex-1 ${currentTheme.bg} ${currentTheme.text} border-none outline-none caret-${currentTheme.accent.replace('#', '')}`}
                                            placeholder="Type a command..."
                                            spellCheck="false"
                                            autoComplete="off"
                                            autoCapitalize="off"
                                            autoCorrect="off"
                                        />
                                        <div className="text-xs text-gray-500 hidden sm:block">
                                            Press <kbd className="px-2 py-1 bg-gray-800 rounded">Enter</kbd> to execute
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Completion Message */}
                            {isComplete && (
                                <motion.div 
                                    className={`mt-6 p-4 rounded-lg border ${currentTheme.border} ${currentTheme.text}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <Sparkles className="w-5 h-5" />
                                        <span className="font-bold">Terminal session complete!</span>
                                    </div>
                                    <p className="text-sm">
                                        Ready to connect? Use the command line above or click the buttons below.
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Terminal Footer */}
                        <div className={`px-4 py-3 ${currentTheme.header} border-t ${currentTheme.border} flex flex-col sm:flex-row items-center justify-between gap-3`}>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                    <span className="text-xs text-gray-400">
                                        {isTyping ? 'Typing...' : 'Paused'}
                                    </span>
                                </div>
                                <div className="hidden sm:flex items-center gap-2">
                                    <Command className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-500">{terminalHistory.length} lines</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleTyping}
                                    className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                                >
                                    {isTyping ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    {isTyping ? 'Pause' : 'Play'}
                                </button>
                                <button
                                    onClick={resetTerminal}
                                    className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                </button>
                                <button
                                    onClick={skipAnimation}
                                    className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                                >
                                    <Zap className="w-3 h-3" />
                                    Skip
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Buttons & Stats */}
                    <motion.div 
                        className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* CTA Buttons */}
                        <div className="lg:col-span-2">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={primaryCTA.onClick}
                                    className="group flex-1 px-6 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryCTA.color}, ${currentTheme.accent})`,
                                        boxShadow: `0 10px 30px ${primaryCTA.color}40`,
                                    }}
                                >
                                    <span className="relative z-10 text-white flex items-center justify-center gap-3">
                                        {primaryCTA.icon}
                                        {primaryCTA.text}
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                    </div>
                                </button>

                                <button
                                    onClick={secondaryCTA.onClick}
                                    className="group flex-1 px-6 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border-2"
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
                            </div>
                            
                            {/* Quick Commands */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() => setUserInput('help')}
                                    className="px-3 py-1.5 text-xs rounded border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors"
                                >
                                    help
                                </button>
                                <button
                                    onClick={() => setUserInput('projects')}
                                    className="px-3 py-1.5 text-xs rounded border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors"
                                >
                                    projects
                                </button>
                                <button
                                    onClick={() => setUserInput('contact')}
                                    className="px-3 py-1.5 text-xs rounded border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors"
                                >
                                    contact
                                </button>
                                <button
                                    onClick={() => setUserInput('social')}
                                    className="px-3 py-1.5 text-xs rounded border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors"
                                >
                                    social
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="p-3 rounded-xl border backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                                    style={{ borderColor: `${stat.color}40` }}
                                    whileHover={{ y: -3, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div 
                                            className="p-1.5 rounded-lg"
                                            style={{ backgroundColor: `${stat.color}20` }}
                                        >
                                            <div style={{ color: stat.color }}>
                                                {stat.icon}
                                            </div>
                                        </div>
                                        <div className="text-xl font-bold" style={{ color: stat.color }}>
                                            {stat.value}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Social Links & Status */}
                    <motion.div 
                        className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((link, index) => (
                                <motion.a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl border backdrop-blur-sm hover:shadow-lg transition-all duration-300 group"
                                    style={{ borderColor: `${currentTheme.accent}30` }}
                                    whileHover={{ y: -3, scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setUserInput(link.command)}
                                >
                                    <div className="text-gray-400 group-hover:text-white transition-colors">
                                        {link.icon}
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        {/* Status Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span>{availability}</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <Coffee className="w-4 h-4" />
                                <span>{status}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Theme Selector */}
                <div className="fixed bottom-4 right-4 z-20">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-xl bg-black/40 border border-white/10">
                        <Code2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Theme: {theme}</span>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <span className="text-xs">Type or click to interact</span>
                        <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-1 h-4 rounded-full bg-gray-600"
                                    animate={{ height: ['16px', '24px', '16px'] }}
                                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                
                /* Hide scrollbar but allow scrolling */
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background-color: rgba(31, 41, 55, 0.8);
                    border-radius: 3px;
                }
                
                /* Hide input number spinners */
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                
                /* Hide password reveal icon in some browsers */
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear {
                    display: none;
                }
                
                /* Terminal text selection */
                ::selection {
                    background-color: ${currentTheme.accent}40;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default TerminalHero;
