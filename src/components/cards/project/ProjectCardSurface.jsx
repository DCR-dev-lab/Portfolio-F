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
    <div className="relative z-10 flex h-full flex-col justify-end p-6 cursor-default">
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
                    <div className="h-px w-6 bg-purple-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-300">
                        {project.type}
                    </span>
                </div>
            )}

            <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">
                {project.title}
            </h3>

            <p className="text-sm leading-relaxed text-gray-300 line-clamp-2 max-w-sm">
                {project.shortDescription}
            </p>

            {project.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {project.technologies.slice(0, 3).map((tech) => (
                        <span
                            key={tech}
                            className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium rounded-full border border-white/20 cursor-default select-none"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.technologies.length > 3 && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30 cursor-default select-none">
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
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full text-xs font-bold hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                    View Details
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-3 border-l border-white/[0.15] pl-3">
                    {project.projectUrl && (
                        <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
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
                            className="text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
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
