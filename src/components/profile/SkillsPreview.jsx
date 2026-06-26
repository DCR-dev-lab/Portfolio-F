import { useEffect, useState, useRef } from "react";
import { Zap, TrendingUp } from 'lucide-react';

import { getSkills } from "../../services/skill.service";
import { SkillCard } from "../cards/SkillCard";

import { Link } from "react-router-dom";

const SkillsPreview = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredSkill, setHoveredSkill] = useState(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await getSkills();
                setSkills(res.data.slice(0, 6));
            } catch (err) {
                console.error(err.message || "Failed to load skills");
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();
    }, []);

    const previewSkills = skills.slice(0, 6);

    const getGradientColor = (index) => {
        const gradients = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-orange-500 to-red-500',
            'from-green-500 to-emerald-500',
            'from-yellow-500 to-orange-500',
            'from-indigo-500 to-purple-500',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <section ref={sectionRef} className="relative py-20 md:py-32 px-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden min-h-[600px]">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <div className="relative max-w-6xl mx-auto">
                {/* Section Header - Always visible */}
                <div
                    className={`text-center mb-12 md:mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                >
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                        <Zap className="w-4 h-4 text-yellow-300" />
                        <span className="text-white/90 text-sm font-semibold">What I'm great at</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">
                        Skills & Expertise
                    </h2>
                    <div className="mt-4 w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full" />
                </div>

                {/* Skills Grid or Loading/Empty States */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/10"
                            />
                        ))}
                    </div>
                ) : previewSkills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {previewSkills.map((skill, index) => (
                            <div
                                key={skill._id}
                                onMouseEnter={() => setHoveredSkill(skill._id)}
                                onMouseLeave={() => setHoveredSkill(null)}
                                className={`transition-transform duration-300 ${hoveredSkill === skill._id ? 'scale-105 z-10' : 'scale-100'
                                    }`}
                            >
                                <SkillCard
                                    skill={skill}
                                    gradient={getGradientColor(index)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No skills to display</p>
                    </div>
                )}

                {/* View All Link - Only show if there are skills */}
                {!loading && previewSkills.length > 0 && (
                    <div
                        className={`text-center mt-10 md:mt-12 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        <Link to="/skills"
                            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-semibold hover:bg-white/20 hover:border-white/40 transition-all hover:scale-105 group"
                        >
                            <span>Explore All Skills</span>
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SkillsPreview;