import { AnimatePresence, motion } from "motion/react";
import {
    Edit2,
    ExternalLink,
    Github,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";

export const ProjectCardCurtain = ({
    project,
    showCurtain,
    closeCurtain,
    isAdmin,
    onEdit,
    onDelete,
    indexLabel,
}) => (
    <AnimatePresence>
        {showCurtain && (
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 220 }}
                className="absolute inset-0 z-50 flex flex-col rounded-2xl overflow-hidden bg-[#0c0a09]/98 backdrop-blur-2xl border border-stone-800 cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-stone-800/80 px-5 py-3.5 flex-shrink-0 bg-stone-900/50">
                    <div className="inline-flex items-center gap-2 bg-red-950/40 px-3 py-1 rounded-full border border-red-500/25">
                        <Sparkles className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-red-300 text-xs font-mono">
                            Project Details
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={closeCurtain}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 border border-stone-800 text-stone-400 transition-all duration-200 hover:bg-stone-800 hover:text-white cursor-pointer"
                        aria-label="Close details panel"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar cursor-default">
                    <div>
                        <h4 className="text-xl font-bold text-[#faf8f5] mb-2 leading-tight">
                            {project.title}
                        </h4>
                        <div className="h-px w-12 bg-red-500 rounded-full" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm leading-relaxed text-stone-300">
                            {project.shortDescription}
                        </p>
                        {project.longDescription && (
                            <p className="text-sm leading-relaxed text-stone-400">
                                {project.longDescription}
                            </p>
                        )}
                    </div>

                    {(project.status || project.type) && (
                        <div className="flex gap-2 flex-wrap">
                            {project.status && (
                                <span className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-full px-3 py-1 text-xs text-stone-300 font-mono cursor-default select-none">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                    {project.status}
                                </span>
                            )}
                            {project.type && (
                                <span className="bg-stone-900 border border-stone-800 rounded-full px-3 py-1 text-xs text-red-400 font-mono cursor-default select-none">
                                    {project.type}
                                </span>
                            )}
                        </div>
                    )}

                    {project.technologies?.length > 0 && (
                        <div>
                            <h5 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-400 mb-3">
                                <span className="h-px w-4 bg-red-500/60 inline-block" />
                                Tech Stack
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                                {project.technologies.map((tech) => (
                                    <span
                                        key={tech}
                                        className="px-2.5 py-1 bg-stone-900 text-stone-300 text-xs font-mono rounded-md border border-stone-800 cursor-default select-none hover:border-red-500/30"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2.5 flex-wrap pt-2">
                        {project.projectUrl && (
                            <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-sm shadow-red-900/40 transition-all duration-200 cursor-pointer active:scale-95"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>Live Demo</span>
                            </a>
                        )}
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-stone-900 border border-stone-800 text-stone-300 px-5 py-2 rounded-full text-xs font-medium hover:text-white hover:border-stone-700 transition-all duration-200 cursor-pointer"
                            >
                                <Github className="h-3.5 w-3.5" />
                                <span>Source Code</span>
                            </a>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="pt-4 border-t border-stone-800">
                            <h5 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-400 mb-3">
                                <span className="h-px w-4 bg-red-500/60 inline-block" />
                                Admin Controls
                            </h5>
                            <div className="flex gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => onEdit?.(project)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 border border-stone-700 text-stone-200 rounded-lg text-xs font-medium hover:bg-stone-800 transition-all duration-200 cursor-pointer"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete?.(project._id)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-950/40 border border-red-800/40 text-red-300 rounded-lg text-xs font-medium hover:bg-red-900/60 transition-all duration-200 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-stone-800/80 px-5 py-3 flex-shrink-0 bg-[#0c0a09]">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                        <span>
                            Project_{indexLabel}
                        </span>
                        <span className="flex items-center gap-1.5 text-stone-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                            Production Build
                        </span>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);
