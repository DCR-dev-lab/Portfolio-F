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
        setTimeout(() => setIsAnimating(false), 600);
    };

    const closeCurtain = (e) => {
        e?.stopPropagation();
        if (isAnimating || !showCurtain) return;
        setIsAnimating(true);
        setShowCurtain(false);
        setTimeout(() => setIsAnimating(false), 600);
    };

    const indexLabel = (index + 1).toString().padStart(2, "0");

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.5, ease: "easeOut" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-2xl ${showCurtain ? "cursor-default" : "cursor-pointer"
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
                        "radial-gradient(ellipse at 50% 110%, rgba(168,85,247,0.2) 0%, transparent 65%)",
                }}
            />

            <div className="absolute top-4 right-4 z-20 select-none cursor-default">
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-[10px] font-medium text-purple-200">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
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
                    background: linear-gradient(180deg, #a855f7, #ec4899);
                    border-radius: 10px;
                }
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #a855f7 transparent; }
            `}</style>
        </motion.div>
    );
};

export default ProjectCard;
