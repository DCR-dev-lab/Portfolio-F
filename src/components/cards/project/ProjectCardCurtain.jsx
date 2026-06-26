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
                className="absolute inset-0 z-50 flex flex-col rounded-2xl overflow-hidden bg-slate-900/95 backdrop-blur-sm border border-white/10 cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 flex-shrink-0">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-purple-200 text-xs font-medium">
                            Project Details
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={closeCurtain}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white/50 transition-all duration-200 hover:bg-white/20 hover:text-white cursor-pointer"
                        aria-label="Close details panel"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar cursor-default">
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2 leading-tight">
                            {project.title}
                        </h4>
                        <div className="h-0.5 w-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm leading-relaxed text-gray-300">
                            {project.shortDescription}
                        </p>
                        {project.longDescription && (
                            <p className="text-sm leading-relaxed text-gray-400">
                                {project.longDescription}
                            </p>
                        )}
                    </div>

                    {(project.status || project.type) && (
                        <div className="flex gap-2 flex-wrap">
                            {project.status && (
                                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-gray-300 cursor-default select-none">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                    {project.status}
                                </span>
                            )}
                            {project.type && (
                                <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-gray-300 cursor-default select-none">
                                    {project.type}
                                </span>
                            )}
                        </div>
                    )}

                    {project.technologies?.length > 0 && (
                        <div>
                            <h5 className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-widest mb-3">
                                <span className="h-px w-5 bg-purple-500/50 inline-block" />
                                Tech Stack
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech) => (
                                    <span
                                        key={tech}
                                        className="px-3 py-1.5 bg-white/5 text-gray-300 text-xs font-medium rounded-lg border border-purple-500/20 hover:border-purple-500/40 hover:bg-white/10 transition-all duration-150 cursor-default select-none"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2.5 flex-wrap">
                        {project.projectUrl && (
                            <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Project
                            </a>
                        )}
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                                <Github className="h-3.5 w-3.5" />
                                Source Code
                            </a>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="pt-4 border-t border-white/10">
                            <h5 className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-widest mb-3">
                                <span className="h-px w-5 bg-purple-500/50 inline-block" />
                                Admin Controls
                            </h5>
                            <div className="flex gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => onEdit?.(project)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold hover:bg-amber-500/25 transition-all duration-200 cursor-pointer"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete?.(project._id)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold hover:bg-red-500/25 transition-all duration-200 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 px-5 py-3 flex-shrink-0 bg-white/[0.02]">
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span className="text-purple-300/50 font-medium">
                            Project_{indexLabel}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                            Available for collaboration
                        </span>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);
