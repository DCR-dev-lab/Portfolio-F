import { useEffect, useMemo, useState } from "react";
import { Code2, Search, Sparkles, X, Zap } from "lucide-react";

import { SkillCard } from "../../components/cards/SkillCard";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loader1 from "../../components/common/loader/Loader1";
import { getSkills } from "../../services/skill.service";

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchSkills = async () => {
            setLoading(true);
            try {
                const res = await getSkills();
                setSkills(res.data ?? []);
                setError("");
            } catch (err) {
                console.error("Failed to load skills:", err);
                setError(err.message || "Failed to load skills.");
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = skills
            .map((skill) => skill.category)
            .filter(Boolean);

        return ["All", ...new Set(uniqueCategories)];
    }, [skills]);

    const filteredSkills = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        return skills.filter((skill) => {
            const name = skill.name?.toLowerCase() ?? "";
            const category = skill.category?.toLowerCase() ?? "";
            const matchesSearch = !normalizedSearch ||
                name.includes(normalizedSearch) ||
                category.includes(normalizedSearch);
            const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory, skills]);

    const averageProficiency = skills.length
        ? Math.round(skills.reduce((total, skill) => total + Number(skill.proficiency || 0), 0) / skills.length)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Loader1 />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
                <section className="relative pt-32 pb-20 px-6">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-24 right-16 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                        <div className="absolute bottom-16 left-10 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:56px_56px]" />

                    <div className="relative max-w-7xl mx-auto">
                        <div className="mb-10">
                            <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/15">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                <span className="text-purple-100 font-medium">Technical Toolkit</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">
                                Skills & Expertise
                            </h1>
                            <p className="max-w-3xl text-gray-300 text-lg leading-relaxed">
                                A focused view of the technologies, platforms, and practices I use to build reliable digital products.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
                                <p className="text-sm text-purple-200 mb-1">Total Skills</p>
                                <p className="text-3xl font-bold">{skills.length}</p>
                            </div>
                            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
                                <p className="text-sm text-purple-200 mb-1">Categories</p>
                                <p className="text-3xl font-bold">{Math.max(categories.length - 1, 0)}</p>
                            </div>
                            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
                                <p className="text-sm text-purple-200 mb-1">Average Level</p>
                                <p className="text-3xl font-bold">{averageProficiency}%</p>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 mb-10">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search skills"
                                    className="w-full bg-white/10 border border-white/15 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-gray-400 outline-none focus:border-purple-300 focus:bg-white/15 transition"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => {
                                    const isActive = selectedCategory === category;

                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-5 py-3 rounded-full font-semibold transition-all ${isActive
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                                                : "bg-white/10 border border-white/15 text-gray-200 hover:bg-white/15"
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {error ? (
                            <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-8 text-center">
                                <p className="text-red-200">{error}</p>
                            </div>
                        ) : skills.length === 0 ? (
                            <div className="bg-white/10 border border-white/15 rounded-2xl p-10 text-center">
                                <Zap className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
                                <p className="text-xl font-semibold">No skills have been added yet.</p>
                            </div>
                        ) : filteredSkills.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredSkills.map((skill) => (
                                    <SkillCard key={skill._id} skill={skill} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/10 border border-white/15 rounded-2xl p-10 text-center">
                                <Code2 className="w-10 h-10 mx-auto mb-4 text-purple-200" />
                                <p className="text-xl font-semibold mb-2">No matching skills</p>
                                <p className="text-gray-300">Try a different search or category.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default Skills;
