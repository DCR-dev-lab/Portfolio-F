import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

import { ProjectCardBackground } from "./ProjectCardBackground";
import { ProjectCardCurtain } from "./ProjectCardCurtain";
import { ProjectCardSurface } from "./ProjectCardSurface";

const ProjectCard = ({
    project,
    isAdmin = false,
    onEdit,
    onDelete,
    index = 0,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showCurtain, setShowCurtain] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const openCurtain = () => {
        if (isAnimating || showCurtain) return;
        setIsAnimating(true);
        setShowCurtain(true);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const closeCurtain = (e) => {
        e?.stopPropagation();
        if (isAnimating || !showCurtain) return;
        setIsAnimating(true);
        setShowCurtain(false);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const indexLabel = (index + 1).toString().padStart(2, "0");

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative h-[420px] w-full overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/40 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-red-500/40 ${
                showCurtain ? "cursor-default" : "cursor-pointer"
            }`}
            onClick={() => !showCurtain && openCurtain()}
            role="button"
            aria-expanded={showCurtain}
            aria-label={`${project.title} - click to view details`}
        >
            <ProjectCardBackground
                project={project}
                isHovered={isHovered}
                showCurtain={showCurtain}
            />

            <motion.div
                animate={{ opacity: isHovered && !showCurtain ? 1 : 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-[1] pointer-events-none rounded-2xl"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 110%, rgba(220,38,38,0.14) 0%, transparent 65%)",
                }}
            />

            <div className="absolute top-4 right-4 z-20 select-none cursor-default">
                <span className="inline-flex items-center gap-1.5 bg-[#0c0a09]/90 backdrop-blur-md border border-stone-800 rounded-full px-3 py-1 text-[11px] font-mono text-stone-400 group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                    <Sparkles className="w-3 h-3 text-red-400" />
                    {indexLabel}
                </span>
            </div>

            <ProjectCardSurface
                project={project}
                showCurtain={showCurtain}
                openCurtain={openCurtain}
            />

            <ProjectCardCurtain
                project={project}
                showCurtain={showCurtain}
                closeCurtain={closeCurtain}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
                indexLabel={indexLabel}
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #dc2626;
                    border-radius: 9999px;
                }
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #dc2626 transparent; }
            `}</style>
        </motion.div>
    );
};

export default ProjectCard;
