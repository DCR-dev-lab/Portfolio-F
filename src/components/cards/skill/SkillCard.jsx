import {
    Edit2,
    Sparkles,
    Trash2,
} from "lucide-react";

import { CategoryIcon } from "./CategoryIcon";
import { getLevelStyle, normalizeProficiency } from "./levelStyles";

export const SkillCard = ({
    skill,
    gradient = "from-purple-500 to-pink-500",
    isAdmin = false,
    onEdit,
    onDelete,
}) => {
    const proficiency = normalizeProficiency(skill?.proficiency);
    const level = getLevelStyle(proficiency);

    return (
        <article className="group relative h-full min-h-[220px] overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/15 hover:shadow-2xl">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

            <div className="relative flex h-full flex-col">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <CategoryIcon
                        category={skill?.category}
                        iconKeyword={skill?.iconKeyword}
                        skillName={skill?.name}
                        className="h-6 w-6"
                    />
                </div>

                    <span className={`rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ${level.text}`}>
                        {level.label}
                    </span>
                </div>

                <div className="mb-5 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-300" aria-hidden="true" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-100">
                            {skill?.category || "Skill"}
                        </p>
                    </div>
                    <h3 className="text-2xl font-bold leading-tight">
                        {skill?.name || "Untitled skill"}
                    </h3>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-300">Proficiency</span>
                        <span className="font-bold">{proficiency}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${level.bar} transition-all duration-700`}
                            style={{ width: `${proficiency}%` }}
                        />
                    </div>
                </div>

                {isAdmin && (
                    <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
                        <button
                            type="button"
                            onClick={() => onEdit?.(skill)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/30"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete?.(skill?._id)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
};

export default SkillCard;
