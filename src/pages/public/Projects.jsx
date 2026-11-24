import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    Briefcase,
    Code2,
    ArrowRight,
    ArrowLeft,
    LayoutGrid,
    Box,
    Compass,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import PageLoader from "../../components/common/PageLoader";
import PageError from "../../components/common/PageError";
import ParticleHeading from "../../components/particles/ParticleHeading";
import SearchBar from "../../components/ui/SearchBar";
import EmptyState from "../../components/ui/EmptyState";
import { getProjects } from "../../services/project.service";
import usePageSEO from "../../hooks/usePageSEO";
import useCatalogFilter from "../../hooks/useCatalogFilter";
import { CURTAIN_DEPTH } from "../../constants/layout";

import BentoMosaicGrid from "../../components/projects/BentoMosaicGrid";
import ProjectDetailView, { getProjectId } from "../../components/projects/ProjectDetailView";

// Loaded on demand so three.js is only downloaded when a 3D view is opened
const TunnelGallery = lazy(() => import("../../components/projects/TunnelGallery"));
const InfiniteCanvas = lazy(() => import("../../components/projects/InfiniteCanvas"));

const SceneFallback = () => (
    <div
        role="status"
        aria-label="Loading 3D view"
        className="absolute inset-0 flex items-center justify-center bg-obsidian"
    >
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none" />
    </div>
);

const VIEW_MODES = [
    {
        id: "grid",
        label: "Grid Archive",
        shortLabel: "Grid",
        icon: LayoutGrid,
        desc: "Filterable catalog of every project",
    },
    {
        id: "tunnel",
        label: "Wireframe Tunnel",
        shortLabel: "3D Tunnel",
        icon: Box,
        desc: "Fly through a 3D wireframe corridor",
    },
    {
        id: "canvas",
        label: "Infinite Canvas",
        shortLabel: "Canvas",
        icon: Compass,
        desc: "Pan and zoom an endless gallery",
    },
];

// Change to "grid" if you'd rather not load WebGL on a visitor's first view
const DEFAULT_VIEW = "tunnel";

const getProjectCategory = (project) => project?.category || project?.type;

const matchesProjectSearch = (project, normalizedSearch) => {
    const title = String(project?.title || "").toLowerCase();
    const description = String(project?.shortDescription || "").toLowerCase();
    const category = String(project?.category || project?.type || "").toLowerCase();
    const technologies = (project?.technologies || []).join(" ").toLowerCase();

    return (
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        technologies.includes(normalizedSearch)
    );
};

const Projects = () => {
    usePageSEO({
        title: "All Projects & Work | Denny Charles Raj",
        description:
            "Browse Denny Charles Raj's curated project catalog featuring production web applications, open-source utilities, and responsive full-stack systems.",
    });

    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();
    const [searchParams, setSearchParams] = useSearchParams();

    // ?view= is validated, so a bad value can no longer produce a blank screen
    const viewParam = searchParams.get("view");
    const activeViewMode = VIEW_MODES.some((m) => m.id === viewParam) ? viewParam : DEFAULT_VIEW;
    const selectedId = searchParams.get("project");

    const updateParams = useCallback(
        (mutate, options) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    mutate(next);
                    return next;
                },
                options
            );
        },
        [setSearchParams]
    );

    const setActiveViewMode = useCallback(
        (mode) => updateParams((p) => p.set("view", mode), { replace: true }),
        [updateParams]
    );

    // If WebGL is unavailable (or its context is lost), drop back to the grid
    const fallbackToGrid = useCallback(() => setActiveViewMode("grid"), [setActiveViewMode]);

    const {
        items: projects,
        loading,
        error,
        refetch: fetchProjects,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        categories,
        filteredItems: filteredProjects,
    } = useCatalogFilter({
        fetcher: getProjects,
        errorMessage: "Failed to load projects.",
        getCategory: getProjectCategory,
        matchesSearch: matchesProjectSearch,
    });

    const [loaderGone, setLoaderGone] = useState(false);

    // Smooth loader dissolve
    useEffect(() => {
        if (loading || error) {
            setLoaderGone(false);
            return;
        }
        const t = setTimeout(() => setLoaderGone(true), 700);
        return () => clearTimeout(t);
    }, [loading, error]);

    const isFullscreen3D = activeViewMode !== "grid";

    // ---- Project detail, driven by ?project=<id> so every project has a link ----
    const selectedProject = useMemo(
        () => (selectedId ? projects.find((p) => getProjectId(p) === selectedId) || null : null),
        [projects, selectedId]
    );

    // Prev/next walks whatever the visitor is browsing: all projects in 3D, the filtered list in the grid
    const navList = isFullscreen3D ? projects : filteredProjects;

    // Opening pushes a history entry so the browser Back button closes the detail view;
    // switching with prev/next replaces it so Back doesn't have to step through every project.
    const openedInApp = useRef(false);
    useEffect(() => {
        if (!selectedId) openedInApp.current = false;
    }, [selectedId]);

    const openProject = useCallback(
        (project) => {
            openedInApp.current = true;
            updateParams((p) => p.set("project", getProjectId(project)));
        },
        [updateParams]
    );

    const switchProject = useCallback(
        (project) => updateParams((p) => p.set("project", getProjectId(project)), { replace: true }),
        [updateParams]
    );

    const closeProject = useCallback(() => {
        if (openedInApp.current) {
            openedInApp.current = false;
            navigate(-1);
        } else {
            updateParams((p) => p.delete("project"), { replace: true });
        }
    }, [navigate, updateParams]);

    if (error && !loading) return <PageError error={error} onRetry={fetchProjects} />;

    // Short crossfade between layouts; instant when the visitor prefers reduced motion
    const fade = { duration: reduceMotion ? 0 : 0.25, ease: "easeOut" };
    const fadeProps = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: fade,
    };

    // Switcher reused in the 3D HUD and the grid header
    const renderSwitcher = (compact = false) => (
        <div
            className={`inline-flex items-center p-1.5 rounded-full bg-stone-900/95 border border-stone-800 shadow-md gap-1 ${
                compact ? "max-w-[calc(100vw-32px)] overflow-x-auto scrollbar-none" : "flex-wrap"
            }`}
        >
            {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeViewMode === mode.id;
                return (
                    <button
                        key={mode.id}
                        type="button"
                        onClick={() => setActiveViewMode(mode.id)}
                        aria-pressed={isActive}
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-sans font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 ${
                            isActive
                                ? "bg-red-600 text-white font-semibold shadow-md shadow-red-950/60"
                                : "text-stone-400 hover:text-cream hover:bg-stone-800/60"
                        }`}
                        title={mode.desc}
                    >
                        <Icon className="w-3.5 h-3.5 text-inherit" aria-hidden="true" />
                        <span className="hidden sm:inline">{mode.label}</span>
                        <span className="sm:hidden">{mode.shortLabel}</span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <>
            <AnimatePresence mode="wait" initial={false}>
                {isFullscreen3D ? (
                    /* ===== Fullscreen 3D shell (Tunnel, Canvas) ===== */
                    <motion.div
                        key="immersive"
                        {...fadeProps}
                        className="fixed inset-0 z-30 w-screen h-screen overflow-hidden bg-obsidian select-none"
                    >
                        {/* Only the scene crossfades when switching Tunnel <-> Canvas; the HUD stays put */}
                        <div className="absolute inset-0 w-full h-full">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div key={activeViewMode} {...fadeProps} className="absolute inset-0">
                                    <Suspense fallback={<SceneFallback />}>
                                        {activeViewMode === "tunnel" && (
                                            <TunnelGallery
                                                projects={projects}
                                                onSelectProject={openProject}
                                                paused={Boolean(selectedProject)}
                                                onUnsupported={fallbackToGrid}
                                            />
                                        )}
                                        {activeViewMode === "canvas" && (
                                            <InfiniteCanvas
                                                projects={projects}
                                                onSelectProject={openProject}
                                                paused={Boolean(selectedProject)}
                                            />
                                        )}
                                    </Suspense>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <header className="pointer-events-none absolute inset-x-0 top-0 p-4 sm:p-6 flex items-center justify-between z-[100]">
                            <Link
                                to="/"
                                className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-stone-900/95 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-cream text-xs font-sans font-medium transition-colors duration-200 shadow-md hover:scale-105 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                title="Return to Home"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                                <span className="font-bold text-cream">DCR</span>
                                <span className="text-stone-400 hidden sm:inline">/ Home</span>
                            </Link>

                            <div className="pointer-events-auto">{renderSwitcher(true)}</div>

                            <div className="pointer-events-auto hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-stone-900/90 border border-stone-800 text-xs font-sans font-medium text-stone-300 shadow-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
                                <span>3D experience</span>
                            </div>
                        </header>
                    </motion.div>
                ) : (
                    /* ===== Classic grid archive ===== */
                    <motion.div
                        key="archive"
                        {...fadeProps}
                        className="relative pt-24 pb-24 px-4 sm:px-6 md:px-8 bg-transparent"
                    >
                        {/* Volumetric laser curtain at the top, matching Home */}
                        <div
                            aria-hidden="true"
                            style={{ height: `${CURTAIN_DEPTH}px` }}
                            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-red-500/[0.08] via-red-500/[0.02] to-transparent"
                        >
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/80 to-transparent shadow-md shadow-red-900/30" />
                        </div>

                        <div className="max-w-7xl mx-auto">
                            {/* Utility row: archive pill left, view switcher right */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 border border-stone-800 text-stone-300">
                                    <Briefcase aria-hidden="true" className="w-3.5 h-3.5 text-red-400" />
                                    <span className="text-xs font-sans font-medium text-stone-300">
                                        Portfolio archive and catalog
                                    </span>
                                </div>

                                <div className="self-end sm:self-auto">{renderSwitcher(false)}</div>
                            </div>

                            {/* Heading */}
                            <div className="mb-10 sm:mb-12">
                                <ParticleHeading
                                    id="projects-archive-heading"
                                    text="Projects"
                                    align="left"
                                    className="w-[min(92vw,480px)] h-[60px] sm:h-[75px] md:h-[85px]"
                                />
                                <p className="text-stone-400 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
                                    A curated index of production applications, architectural prototypes, and full-stack systems.
                                </p>
                            </div>

                            {/* Search and filters */}
                            <div className="space-y-6 mb-8 pt-4 border-t border-stone-800/60">
                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                                    <div className="w-full md:max-w-md">
                                        <SearchBar
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name, tech stack, or keywords..."
                                        />
                                    </div>

                                    <div className="text-xs font-sans text-stone-400 self-end md:self-auto">
                                        Showing <strong className="text-red-400 font-mono font-medium">{filteredProjects.length}</strong> of <span className="font-mono">{projects.length}</span> project{projects.length !== 1 ? "s" : ""}
                                    </div>
                                </div>

                                {categories.length > 1 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                                        {categories.map((category) => {
                                            const isSelected = selectedCategory === category;
                                            return (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(category)}
                                                    aria-pressed={isSelected}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 ${
                                                        isSelected
                                                            ? "bg-red-600 text-white font-semibold shadow-md shadow-red-950/40"
                                                            : "bg-stone-900/70 border border-stone-800 text-stone-400 hover:text-cream hover:border-stone-700"
                                                    }`}
                                                >
                                                    {category}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Bento grid */}
                            {filteredProjects.length === 0 ? (
                                <EmptyState
                                    icon={Code2}
                                    title="No Projects Found"
                                    description="Try adjusting your search criteria or clearing selected filters."
                                    className="my-10"
                                />
                            ) : (
                                <BentoMosaicGrid projects={filteredProjects} onSelectProject={openProject} />
                            )}

                            {/* Call to action */}
                            <div className="mt-24 text-center">
                                <div className="relative overflow-hidden bg-stone-900/40 border border-stone-800 rounded-3xl p-10 md:p-14 max-w-3xl mx-auto shadow-xl">
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-cream mb-3">
                                        Interested in Collaborating?
                                    </h2>
                                    <p className="text-stone-400 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                                        Have an exciting project, architecture discussion, or role in mind? Let’s build something exceptional together.
                                    </p>

                                    <Link
                                        to="/contact"
                                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-full font-semibold text-sm shadow-md shadow-red-900/40 transition-colors duration-200 hover:scale-105 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        <span>Initiate Conversation</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* One detail view for every layout */}
            <ProjectDetailView
                projects={navList}
                project={selectedProject}
                onClose={closeProject}
                onSelect={switchProject}
            />

            {/* Loader dissolve */}
            {!loaderGone && (
                <div
                    className={`fixed inset-0 z-[70] transition-opacity duration-700 ease-out ${
                        loading ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                >
                    <PageLoader />
                </div>
            )}
        </>
    );
};

export default Projects;