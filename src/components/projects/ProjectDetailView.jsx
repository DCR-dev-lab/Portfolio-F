import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowLeft, Github, ChevronLeft, ChevronRight } from "lucide-react";
import { isSafeUrl, sanitizeHref, sanitizeImageUrl } from "../../utils/security";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Stable id used for keys and the ?project= deep link. */
export const getProjectId = (project) =>
    String(
        project?._id ??
            project?.id ??
            project?.slug ??
            String(project?.title || "")
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")
    );

/**
 * ProjectDetailView
 * The single fullscreen detail view for every projects layout.
 * Portalled directly to document.body with z-[999] so it can never be overlapped
 * by Navbars, footers, or parent CSS stacking contexts.
 */
const ProjectDetailView = ({ projects = [], project, onClose, onSelect }) => {
    const reduceMotion = useReducedMotion();
    const rootRef = useRef(null);
    const backRef = useRef(null);
    const touchRef = useRef(null);

    const isOpen = Boolean(project);
    const projectId = project ? getProjectId(project) : null;
    const index = project ? projects.findIndex((p) => getProjectId(p) === projectId) : -1;
    const canNavigate = index !== -1 && projects.length > 1;

    // Latest values for stable listeners
    const latest = useRef({});
    latest.current = { projects, index, canNavigate, onClose, onSelect };

    const go = useCallback((step) => {
        const { projects: list, index: i, canNavigate: ok, onSelect: select } = latest.current;
        if (!ok) return;
        select?.(list[(i + step + list.length) % list.length]);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        backRef.current?.focus();

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                latest.current.onClose?.();
            } else if (e.key === "ArrowLeft") {
                go(-1);
            } else if (e.key === "ArrowRight") {
                go(1);
            } else if (e.key === "Tab" && rootRef.current) {
                const nodes = rootRef.current.querySelectorAll(FOCUSABLE);
                if (!nodes.length) return;
                const first = nodes[0];
                const last = nodes[nodes.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
            previouslyFocused?.focus?.();
        };
    }, [isOpen, go]);

    const handleTouchStart = (e) => {
        const t = e.touches[0];
        touchRef.current = { x: t.clientX, y: t.clientY };
    };

    const handleTouchEnd = (e) => {
        const start = touchRef.current;
        touchRef.current = null;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    };

    const timing = (duration, delay = 0) =>
        reduceMotion ? { duration: 0 } : { duration, delay, ease: "easeOut" };

    const lead = project?.shortDescription || project?.description;
    const hasLive = project?.projectUrl && isSafeUrl(project.projectUrl, { allowMailTel: false });
    const hasSource = project?.githubUrl && isSafeUrl(project.githubUrl, { allowMailTel: false });

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {project && (
                <motion.div
                    key="project-detail"
                    ref={rootRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="project-detail-title"
                    data-lenis-prevent="true"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={timing(0.25)}
                    className="fixed inset-0 z-[999] flex flex-col w-screen h-screen h-[100dvh] overflow-hidden bg-obsidian text-cream"
                >
                    {/* Background artwork under a dark scrim */}
                    <div className="absolute inset-0 z-0 select-none overflow-hidden" aria-hidden="true">
                        {sanitizeImageUrl(project.imageUrl) ? (
                            <motion.img
                                key={projectId}
                                src={sanitizeImageUrl(project.imageUrl)}
                                alt=""
                                initial={{ scale: 1.06, opacity: 0.3 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={timing(0.5)}
                                className="w-full h-full object-cover brightness-[0.4]"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-950 to-obsidian" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/75 to-obsidian/45" />
                    </div>

                    {/* Top bar with dedicated gradient scrim to ensure clean contrast & zero overlap */}
                    <div className="relative z-30 flex shrink-0 items-center justify-between gap-3 p-4 sm:p-6 md:px-10 bg-gradient-to-b from-obsidian via-obsidian/85 to-transparent">
                        <button
                            ref={backRef}
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-xs font-sans font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 shadow-md"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                            <span>Back to projects</span>
                        </button>

                        {canNavigate && (
                            <div className="flex items-center gap-1 bg-stone-900/90 px-2 py-1.5 rounded-full border border-stone-800 shadow-md">
                                <button
                                    type="button"
                                    onClick={() => go(-1)}
                                    aria-label="Previous project"
                                    className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span
                                    className="text-xs font-mono text-stone-300 px-2 select-none"
                                    aria-live="polite"
                                >
                                    {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => go(1)}
                                    aria-label="Next project"
                                    className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content: flexible top spacer anchors short content to bottom while allowing natural top-to-bottom scrolling for long content */}
                    <div
                        data-lenis-prevent="true"
                        className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-8 md:px-12 pb-12"
                    >
                        <motion.div
                            key={projectId}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={timing(0.4, 0.05)}
                            className="min-h-full max-w-5xl mx-auto flex flex-col justify-end"
                        >
                            {/* Dynamic spacer prevents flexbox justify-end top cutoff on smaller screens */}
                            <div className="flex-1 min-h-[24px]" aria-hidden="true" />

                            <div className="py-2">
                                {project.type && (
                                    <p className="mb-2 text-xs sm:text-sm font-sans font-medium text-red-400">
                                        {project.type}
                                    </p>
                                )}

                                <h2
                                    id="project-detail-title"
                                    className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-cream break-words drop-shadow-2xl leading-tight"
                                >
                                    {project.title}
                                </h2>

                                {lead && (
                                    <p className="mt-4 max-w-3xl text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed">
                                        {lead}
                                    </p>
                                )}
                                {project.longDescription && project.longDescription !== lead && (
                                    <p className="mt-3 max-w-3xl text-stone-400 text-sm sm:text-base leading-relaxed">
                                        {project.longDescription}
                                    </p>
                                )}

                                {project.technologies?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-5">
                                        {project.technologies.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 rounded-full bg-stone-900/90 border border-stone-800 text-xs font-mono text-stone-300"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {(hasLive || hasSource) && (
                                    <div className="flex items-center gap-3 mt-8 flex-wrap">
                                        {hasLive && (
                                            <a
                                                href={sanitizeHref(project.projectUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-950/60 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                            >
                                                <span>Visit live site</span>
                                                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                                            </a>
                                        )}
                                        {hasSource && (
                                            <a
                                                href={sanitizeHref(project.githubUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-200 font-medium text-xs sm:text-sm transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                            >
                                                <Github className="w-4 h-4 text-stone-400" aria-hidden="true" />
                                                <span>View source code</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ProjectDetailView;
