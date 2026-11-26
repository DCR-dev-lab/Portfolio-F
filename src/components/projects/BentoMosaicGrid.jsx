import { useState } from "react";
import { ArrowUpRight, Github, Layers } from "lucide-react";
import { getProjectId } from "./ProjectDetailView";
import { isSafeUrl, sanitizeHref, sanitizeImageUrl } from "../../utils/security";

/**
 * BentoMosaicGrid
 * Asymmetric 4-column bento with a hover reveal that is pure CSS (no React state),
 * so hovering never re-renders the grid. Clicking a card hands off to the shared
 * ProjectDetailView through onSelectProject.
 */
const getBentoSpan = (index) => {
    // 8-item repeating cycle for a tight, gap-free 4-column rhythm
    switch (index % 8) {
        case 0:
            return "md:col-span-2 md:row-span-2 min-h-[260px] md:min-h-[500px]"; // hero anchor
        case 2:
        case 6:
            return "md:col-span-1 md:row-span-2 min-h-[240px] md:min-h-[500px]"; // tall tower
        case 4:
        case 7:
            return "md:col-span-2 md:row-span-1 min-h-[240px] md:min-h-[240px]"; // widescreen
        default:
            return "md:col-span-1 md:row-span-1 min-h-[240px] md:min-h-[240px]"; // compact
    }
};

// Shared reveal: fades and rises. Delays are added per element on hover only,
// so the stagger plays on the way in and the way out is immediate.
const REVEAL =
    "opacity-0 translate-y-3 transition-[opacity,transform] duration-500 ease-out " +
    "group-hover:opacity-100 group-hover:translate-y-0 " +
    "group-focus-visible:opacity-100 group-focus-visible:translate-y-0 " +
    "[@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0 " +
    "motion-reduce:transition-none";

const BentoCardArtwork = ({ src }) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-950 to-obsidian flex items-center justify-center">
                <Layers className="w-12 h-12 text-stone-700/60" aria-hidden="true" />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setFailed(true)}
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-90"
            />
            <img
                src={src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                onError={() => setFailed(true)}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none"
            />
        </div>
    );
};

const BentoMosaicGrid = ({ projects = [], onSelectProject }) => (
    <div className="relative w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-2.5 auto-rows-[250px] grid-flow-dense">
            {projects.map((project, index) => {
                const open = () => onSelectProject?.(project);
                const indexLabel = String(index + 1).padStart(2, "0");
                const hasLive = project?.projectUrl && isSafeUrl(project.projectUrl, { allowMailTel: false });
                const hasSource = project?.githubUrl && isSafeUrl(project.githubUrl, { allowMailTel: false });

                return (
                    <div
                        key={`${getProjectId(project)}-${index}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${project.title}`}
                        onClick={open}
                        onKeyDown={(e) => {
                            if (e.target !== e.currentTarget) return;
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                open();
                            }
                        }}
                        className={`group relative overflow-hidden border border-stone-800/80 bg-stone-900/40 cursor-pointer select-none transition-[border-color] duration-500 ease-out hover:border-red-500/60 focus-visible:border-red-500/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 ${getBentoSpan(index)}`}
                    >
                        {/* Artwork: a grayscale base with a colour copy that fades in on top.
                            Fading opacity is much cheaper than animating a filter. */}
                        <div className="absolute inset-0 z-0 bg-obsidian overflow-hidden">
                            <BentoCardArtwork src={sanitizeImageUrl(project.imageUrl)} />
                        </div>

                        {/* Scrim fades separately from the text so it never pops */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-3/4 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none"
                        />

                        {/* Quick-action links (top-left so compact 1x1 cards never cramp) */}
                        {(hasLive || hasSource) && (
                            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none">
                                {hasLive && (
                                    <a
                                        href={sanitizeHref(project.projectUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`Visit ${project.title} live site`}
                                        title="Visit live site"
                                        className="inline-flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-obsidian/85 hover:bg-red-600 border border-stone-700/80 hover:border-red-500 text-stone-200 hover:text-white backdrop-blur-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                    >
                                        <ArrowUpRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                                    </a>
                                )}
                                {hasSource && (
                                    <a
                                        href={sanitizeHref(project.githubUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`View ${project.title} source code`}
                                        title="View source code"
                                        className="inline-flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-obsidian/85 hover:bg-stone-800 border border-stone-700/80 text-stone-200 hover:text-white backdrop-blur-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                    >
                                        <Github className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Index badge */}
                        <span className="absolute top-3 right-3 z-20 inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium bg-red-600 text-white shadow-md shadow-red-950/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none">
                            {indexLabel}
                        </span>

                        {/* Text: each line rises in a beat after the previous one */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6 flex flex-col justify-end">
                            <h3 className={`text-xl sm:text-2xl font-bold tracking-tight text-cream drop-shadow-md ${REVEAL} group-hover:delay-75`}>
                                {project.title}
                            </h3>
                            {project.type && (
                                <p className={`mt-0.5 mb-1 text-xs font-sans font-medium text-red-400 ${REVEAL} group-hover:delay-100`}>
                                    {project.type}
                                </p>
                            )}
                            <p className={`max-w-md text-xs sm:text-sm leading-relaxed text-stone-300 line-clamp-2 ${REVEAL} group-hover:delay-150`}>
                                {project.shortDescription}
                            </p>
                            {project.technologies?.length > 0 && (
                                <div className={`flex flex-wrap gap-1.5 mt-3 ${REVEAL} group-hover:delay-200`}>
                                    {project.technologies.slice(0, 3).map((tech) => (
                                        <span
                                            key={tech}
                                            className="px-2 py-0.5 bg-stone-900/90 border border-stone-800 text-[11px] font-mono text-stone-300"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                    {project.technologies.length > 3 && (
                                        <span className="px-2 py-0.5 bg-stone-900/80 border border-stone-800/80 text-[11px] font-mono text-stone-400">
                                            +{project.technologies.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

export default BentoMosaicGrid;
