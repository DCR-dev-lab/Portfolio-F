import { motion } from "motion/react";
import {
    ArrowUpRight,
    ExternalLink,
    Github,
} from "lucide-react";

export const ProjectCardSurface = ({
    project,
    showCurtain,
    openCurtain,
}) => (
    <div
        className={`relative z-10 flex h-full flex-col justify-end p-6 cursor-default ${
            showCurtain ? "pointer-events-none" : "pointer-events-auto"
        }`}
        aria-hidden={showCurtain}
    >
        <motion.div
            animate={{
                y: showCurtain ? -14 : 0,
                opacity: showCurtain ? 0 : 1,
            }}
            transition={{ duration: 0.25, ease: "easeIn" }}
            className="space-y-3"
        >
            {project.type && (
                <div className="flex items-center gap-2">
                    <div className="h-px w-5 bg-red-500" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">
                        {project.type}
                    </span>
                </div>
            )}

            <h3 className="text-2xl font-bold text-[#faf8f5] leading-tight drop-shadow-md">
                {project.title}
            </h3>

            <p className="text-sm leading-relaxed text-stone-300 line-clamp-2 max-w-sm font-normal">
                {project.shortDescription}
            </p>

            {project.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {project.technologies.slice(0, 3).map((tech) => (
                        <span
                            key={tech}
                            className="px-2.5 py-0.5 bg-stone-900/90 backdrop-blur-md text-stone-300 text-xs font-mono rounded-md border border-stone-700/70 cursor-default select-none"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.technologies.length > 3 && (
                        <span className="px-2 py-0.5 bg-stone-900/80 text-red-300 text-xs font-mono rounded-md border border-stone-800 cursor-default select-none">
                            +{project.technologies.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3 pt-1 flex-wrap">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        openCurtain();
                    }}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer shadow-sm shadow-red-900/40 active:scale-95"
                >
                    <span>View Details</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-2.5 border-l border-stone-700 pl-3">
                    {project.projectUrl && (
                        <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all duration-200 cursor-pointer"
                            aria-label="View live project"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all duration-200 cursor-pointer"
                            aria-label="View source on GitHub"
                        >
                            <Github className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    </div>
);
