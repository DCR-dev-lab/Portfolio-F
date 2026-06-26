import { motion } from "motion/react";

export const ProjectCardBackground = ({ project, isHovered, showCurtain }) => (
    <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
        {project.imageUrl ? (
            <motion.img
                animate={{
                    scale: isHovered && !showCurtain ? 1.07 : 1,
                    filter: showCurtain
                        ? "brightness(0.25)"
                        : isHovered
                            ? "brightness(0.52)"
                            : "brightness(0.45)",
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                src={project.imageUrl}
                alt={project.title}
                className="h-full w-full object-cover"
            />
        ) : (
            <motion.div
                animate={{
                    filter: showCurtain ? "brightness(0.25)" : "brightness(1)",
                }}
                transition={{ duration: 0.6 }}
                className="h-full w-full bg-gradient-to-br from-purple-800 via-slate-800 to-pink-900"
            />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" />
    </div>
);
