import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../services/api";
import { SkillCard } from "../../../components/cards/SkillCard";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { Wrench, Plus, Search, X } from "lucide-react";

const SkillList = ({ skills = [], onDelete }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [confirmState, setConfirmState] = useState({ open: false, skill: null, loading: false });

    const query = searchParams.get("q") || "";
    const category = searchParams.get("cat") || "All";

    const updateFilter = (newQuery, newCat) => {
        const params = new URLSearchParams(searchParams);
        if (newQuery !== undefined) {
            if (newQuery.trim()) params.set("q", newQuery);
            else params.delete("q");
        }
        if (newCat !== undefined) {
            if (newCat && newCat !== "All") params.set("cat", newCat);
            else params.delete("cat");
        }
        setSearchParams(params, { replace: true });
    };

    const categories = useMemo(() => {
        const cats = new Set(["All"]);
        skills.forEach((s) => { if (s.category) cats.add(s.category); });
        return Array.from(cats);
    }, [skills]);

    const filteredSkills = useMemo(() => {
        return skills.filter((s) => {
            const matchesQuery =
                !query ||
                s.name?.toLowerCase().includes(query.toLowerCase()) ||
                s.iconKeyword?.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = category === "All" || s.category === category;
            return matchesQuery && matchesCategory;
        });
    }, [skills, query, category]);

    const requestDelete = (s) => {
        setConfirmState({ open: true, skill: s, loading: false });
    };

    const handleConfirmDelete = async () => {
        setConfirmState((s) => ({ ...s, loading: true }));
        try {
            await api.delete(`/admin/dashboard/skills/${confirmState.skill._id}`);
            toast.success(`"${confirmState.skill.name}" deleted.`);
            onDelete?.();
        } catch {
            toast.error("Failed to delete skill. Please try again.");
        } finally {
            setConfirmState({ open: false, skill: null, loading: false });
        }
    };

    return (
        <>
            <ConfirmDialog
                open={confirmState.open}
                title="Delete skill?"
                message={`"${confirmState.skill?.name}" will be permanently removed from your portfolio. This cannot be undone.`}
                confirmLabel="Delete Skill"
                loading={confirmState.loading}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmState({ open: false, skill: null, loading: false })}
            />

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cream">Skills</h1>
                    <p className="mt-1.5 text-sm text-stone-400">
                        Maintain the skills and categories displayed across the portfolio.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/mod/skills/new")}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                    <Plus size={15} />
                    Add Skill
                </button>
            </div>

            {/* URL Search Params Controls */}
            {skills.length > 0 && (
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input
                            type="text"
                            placeholder="Filter by skill name or icon keyword…"
                            value={query}
                            onChange={(e) => updateFilter(e.target.value, undefined)}
                            className="w-full rounded-lg border border-stone-700/70 bg-stone-900 py-2 pl-9 pr-8 text-xs text-cream placeholder-stone-500 outline-none transition focus:border-crimson/60"
                        />
                        {query && (
                            <button
                                onClick={() => updateFilter("", undefined)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {categories.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => updateFilter(undefined, cat)}
                                    className={`rounded-md px-2.5 py-1 text-xs transition ${
                                        category === cat
                                            ? "bg-stone-700 text-cream font-medium"
                                            : "text-stone-400 hover:bg-stone-800 hover:text-cream"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Count badge */}
            {skills.length > 0 && (
                <p className="mb-4 text-xs text-stone-500">
                    Showing {filteredSkills.length} of {skills.length} skill{skills.length !== 1 ? "s" : ""}
                </p>
            )}

            {/* List */}
            {skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-700/60 bg-stone-900/40 py-16 text-center">
                    <Wrench size={32} className="mb-3 text-stone-600" />
                    <p className="text-base font-semibold text-stone-400">No skills yet</p>
                    <p className="mt-1 text-sm text-stone-600">Add your first skill to populate the portfolio.</p>
                    <button
                        onClick={() => navigate("/mod/skills/new")}
                        className="mt-5 flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        <Plus size={14} /> Add Skill
                    </button>
                </div>
            ) : filteredSkills.length === 0 ? (
                <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-12 text-center text-stone-500">
                    <p className="text-sm">No skills matching your search criteria.</p>
                    <button
                        onClick={() => updateFilter("", "All")}
                        className="mt-2 text-xs text-crimson hover:underline"
                    >
                        Clear search filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSkills.map((skill) => (
                        <SkillCard
                            key={skill._id}
                            skill={skill}
                            isAdmin
                            onEdit={() => navigate(`/mod/skills/${skill._id}`)}
                            onDelete={() => requestDelete(skill)}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default SkillList;
