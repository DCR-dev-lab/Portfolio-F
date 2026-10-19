import { useEffect, useMemo, useState } from "react";
import { Code2, Zap } from "lucide-react";

import { SkillCard } from "../../components/cards/SkillCard";
import PageLoader from "../../components/common/PageLoader";
import PageError from "../../components/common/PageError";
import SectionHeader from "../../components/common/SectionHeader";
import SearchBar from "../../components/ui/SearchBar";
import EmptyState from "../../components/ui/EmptyState";
import { getSkills } from "../../services/skill.service";
import usePageSEO from "../../hooks/usePageSEO";

const Skills = () => {
    usePageSEO({
        title: "Technical Skills & Stack",
        description: "Explore Denny Charles Raj's technical proficiencies across React 19, Node.js, Express, MongoDB, Tailwind CSS, and full-stack architecture.",
    });

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

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

    useEffect(() => {
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
            const matchesSearch =
                !normalizedSearch ||
                name.includes(normalizedSearch) ||
                category.includes(normalizedSearch);
            const matchesCategory =
                selectedCategory === "All" || skill.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory, skills]);

    const averageProficiency = skills.length
        ? Math.round(
              skills.reduce(
                  (total, skill) => total + Number(skill.proficiency || 0),
                  0
              ) / skills.length
          )
        : 0;

    if (loading) return <PageLoader />;

    if (error) return <PageError error={error} onRetry={fetchSkills} />;

    return (
        <div className="pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <SectionHeader
                    as="h1"
                    align="left"
                    badge="Technical Expertise"
                    icon={Code2}
                    title="Skills & Capabilities"
                    subtitle="Comprehensive inventory of languages, frameworks, developer tools, and system methodologies."
                    className="mb-12"
                />

                {/* KPI Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-md hover:border-red-500/20 transition-colors">
                        <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-1">Total Skills</p>
                        <p className="text-3xl font-bold font-mono text-[#faf8f5]">{skills.length}</p>
                    </div>
                    <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-md hover:border-red-500/20 transition-colors">
                        <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-1">Categories</p>
                        <p className="text-3xl font-bold font-mono text-[#faf8f5]">{Math.max(categories.length - 1, 0)}</p>
                    </div>
                    <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-md hover:border-red-500/20 transition-colors">
                        <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-1">Avg. Proficiency</p>
                        <p className="text-3xl font-bold font-mono text-[#faf8f5]">{averageProficiency}%</p>
                    </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col lg:flex-row gap-4 mb-10">
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by skill name or category..."
                        className="flex-1"
                    />

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map((category) => {
                            const isActive = selectedCategory === category;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                                        isActive
                                            ? "bg-red-600 text-white font-semibold shadow-sm shadow-red-600/30"
                                            : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700"
                                    }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Skill Cards Grid */}
                {skills.length === 0 ? (
                    <EmptyState
                        icon={Zap}
                        title="No skills added yet"
                        description="Add your skills through the admin dashboard"
                        className="my-8"
                    />
                ) : filteredSkills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredSkills.map((skill) => (
                            <SkillCard key={skill._id} skill={skill} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Code2}
                        title="No matching skills"
                        description="Try searching with a different keyword or category."
                        className="my-8"
                    />
                )}
            </div>
        </div>
    );
};

export default Skills;
