import { useState, useEffect } from "react";
import { Briefcase, Code2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import ProjectCard from "../../components/cards/ProjectCard";
import PageLoader from "../../components/common/PageLoader";
import PageError from "../../components/common/PageError";
import SectionHeader from "../../components/common/SectionHeader";
import SearchBar from "../../components/ui/SearchBar";
import EmptyState from "../../components/ui/EmptyState";
import { getProjects } from "../../services/project.service";
import usePageSEO from "../../hooks/usePageSEO";

const Projects = () => {
    usePageSEO({
        title: "All Projects & Work",
        description: "Browse Denny Charles Raj's curated project catalog featuring production web applications, open-source utilities, and responsive full-stack systems.",
    });

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const projectsRes = await getProjects();
            setProjects(projectsRes.data || []);
            setError("");
        } catch (err) {
            console.error("Failed to load projects:", err);
            setError(err.message || "Failed to load projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filteredProjects = (projects ?? []).filter((project) => {
        const title = String(project?.title || "").toLowerCase();
        const description = String(project?.shortDescription || "").toLowerCase();
        const category = String(project?.category || "").toLowerCase();
        const technologies = (project?.technologies || []).join(" ").toLowerCase();

        return (
            !normalizedSearch ||
            title.includes(normalizedSearch) ||
            description.includes(normalizedSearch) ||
            category.includes(normalizedSearch) ||
            technologies.includes(normalizedSearch)
        );
    });

    if (loading) return <PageLoader />;

    if (error) return <PageError error={error} onRetry={fetchProjects} />;

    return (
        <div className="pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <SectionHeader
                    as="h1"
                    align="left"
                    badge="Portfolio Archive"
                    icon={Briefcase}
                    title="All Projects"
                    subtitle="A curated index of production applications, open-source libraries, and interactive experiments."
                    className="mb-12"
                />

                {/* Search Bar */}
                <div className="mb-10 max-w-xl">
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, tech stack, or keywords..."
                    />
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-800/80 text-xs font-mono text-stone-500">
                    <span>
                        Showing <strong className="text-red-400 font-semibold">{filteredProjects.length}</strong> project{filteredProjects.length !== 1 ? 's' : ''}
                    </span>
                    {searchQuery && (
                        <span>Filtered by: "{searchQuery}"</span>
                    )}
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <EmptyState
                        icon={Code2}
                        title="No Projects Found"
                        description="Try adjusting your search criteria or keywords."
                        className="my-8"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {filteredProjects.map((project, index) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                <div className="mt-24 text-center">
                    <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-10 md:p-14 max-w-3xl mx-auto backdrop-blur-md">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#faf8f5] mb-3">
                            Interested in Collaborating?
                        </h2>
                        <p className="text-stone-400 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                            I'm always open to discussing new opportunities, consulting projects, or technical leadership roles.
                        </p>

                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-red-900/40 transition-all hover:scale-105 active:scale-95 group"
                        >
                            <span>Get in Touch</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;
