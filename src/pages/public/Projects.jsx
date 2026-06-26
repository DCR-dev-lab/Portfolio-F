import { useState, useEffect } from "react";
import { Search, X, Sparkles, Code2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import ProjectCard from "../../components/cards/ProjectCard";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

import Loader1 from "../../components/common/loader/Loader1";

import { getProjects } from "../../services/project.service";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory] = useState("All");

    // const categories = ["All", "Web App", "SaaS", "Productivity", "Social", "AI/ML"];

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const projectsRes = await getProjects();
                setProjects(projectsRes.data);
                setError("");
            } catch (err) {
                console.error("Failed to load projects:", err);
                setError(err.message || "Failed to load projects.");
            }
            finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filteredProjects = (projects ?? []).filter((project) => {
        const title = String(project?.title || "Untitled Project").toLowerCase();
        const description = String(project?.shortDescription || "").toLowerCase();
        const category = String(project?.category || "").toLowerCase();
        const matchesSearch = !normalizedSearch || title.includes(normalizedSearch) || description.includes(normalizedSearch) || category.includes(normalizedSearch);
        const matchesCategory = selectedCategory === "All" || category === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
                <div className="text-center">
                    {/* <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading projects...</p> */}
                    <Loader1 />
                </div>
            </div>

        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
                <div className="text-center bg-red-500/10 backdrop-blur-sm border border-red-500/50 rounded-2xl p-8">
                    <p className="text-red-400 text-lg">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden pt-4 ">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative z-10 py-20 px-6">
                    <div className="max-w-7xl mx-auto">

                        {/* Header */}
                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <span className="text-purple-200 font-medium">My Work</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                                Featured <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Projects</span>
                            </h1>

                            <p className="text-gray-300 text-lg max-w-3xl">
                                A collection of projects I've worked on, from web applications to AI experiments. Each project represents a unique challenge and learning experience.
                            </p>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="mb-12 space-y-6">
                            {/* Search */}
                            <div className="relative max-w-2xl">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-100" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            {/* <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2 text-purple-300">
                                    <Filter className="w-5 h-5" />
                                    <span className="font-semibold">Filter:</span>
                                </div>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === category
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                            : "bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/20"
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div> */}
                        </div>

                        {/* Projects Grid */}
                        {filteredProjects.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                                    <Code2 className="w-10 h-10 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No Projects Found</h3>
                                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-gray-300">
                                        Showing <span className="text-purple-400 font-bold">{filteredProjects.length}</span> project{filteredProjects.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredProjects.map((project, index) => (
                                        <ProjectCard
                                            key={project._id}
                                            project={project}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Call to Action */}
                        <div className="mt-20 text-center">
                            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/30">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    Like What You See?
                                </h2>
                                <p className="text-purple-200 text-lg mb-8 max-w-2xl mx-auto">
                                    I'm always open to new opportunities and collaborations. Let's build something amazing together!
                                </p>

                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                                >
                                    Get in Touch
                                    <ExternalLink className="w-6 h-6" />
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
            </section>
            <Footer />
        </>
    );
};

export default Projects;
