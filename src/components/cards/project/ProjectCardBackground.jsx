import { motion } from "motion/react";
import { sanitizeImageUrl } from "../../../utils/security";

export const ProjectCardBackground = ({ project, isHovered, showCurtain }) => {
    const safeImageSrc = sanitizeImageUrl(project.imageUrl);
    return (
    <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl bg-zinc-950">
        {safeImageSrc ? (
            <motion.img
                animate={{
                    scale: isHovered && !showCurtain ? 1.05 : 1,
                    filter: showCurtain
                        ? "brightness(0.25)"
                        : isHovered
                            ? "brightness(0.55) contrast(1.05)"
                            : "brightness(0.42) contrast(1.05)",
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                src={safeImageSrc}
                alt={project.title}
                className="h-full w-full object-cover grayscale contrast-105 group-hover:grayscale-0 transition-all duration-700"
            />
        ) : (
            <motion.div
                animate={{
                    filter: showCurtain ? "brightness(0.25)" : "brightness(1)",
                }}
                transition={{ duration: 0.6 }}
                className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950"
            />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />
    </div>
    );
};
