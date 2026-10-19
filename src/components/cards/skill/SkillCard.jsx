import {
    Edit2,
    Sparkles,
    Trash2,
} from "lucide-react";

import { CategoryIcon } from "./CategoryIcon";
import { getLevelStyle, normalizeProficiency } from "./levelStyles";

export const SkillCard = ({
    skill,
    isAdmin = false,
    onEdit,
    onDelete,
}) => {
    const proficiency = normalizeProficiency(skill?.proficiency);
    const level = getLevelStyle(proficiency);

    return (
        <article className="group relative h-full min-h-[200px] overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 text-[#faf8f5] shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:bg-stone-900/70">
            {/* Top Accent Line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent group-hover:via-red-400 transition-all duration-500" />

            <div className="relative flex h-full flex-col justify-between">
                <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-800 border border-stone-700/60 text-red-400 shadow-inner group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-colors">
                            <CategoryIcon
                                category={skill?.category}
                                iconKeyword={skill?.iconKeyword}
                                skillName={skill?.name}
                                className="h-5 w-5"
                            />
                        </div>

                        <span className={`rounded-full bg-stone-800/80 border border-stone-700/60 px-2.5 py-0.5 text-[11px] font-mono ${level.text}`}>
                            {level.label}
                        </span>
                    </div>

                    <div className="mb-4">
                        <div className="mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-red-400" aria-hidden="true" />
                            <p className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                                {skill?.category || "Skill"}
                            </p>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-[#faf8f5] leading-tight group-hover:text-white transition-colors">
                            {skill?.name || "Untitled skill"}
                        </h3>
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-500">Proficiency</span>
                        <span className="text-red-400 font-semibold">{proficiency}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-800">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${level.bar} transition-all duration-700`}
                            style={{ width: `${proficiency}%` }}
                        />
                    </div>
                </div>

                {isAdmin && (
                    <div className="mt-5 flex gap-2 border-t border-stone-800 pt-4">
                        <button
                            type="button"
                            onClick={() => onEdit?.(skill)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-200 transition"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete?.(skill?._id)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 px-3 py-1.5 text-xs font-medium text-red-200 transition"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
};

export default SkillCard;
