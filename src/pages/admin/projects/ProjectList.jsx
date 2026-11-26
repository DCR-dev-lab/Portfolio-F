import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../services/api";
import ProjectCard from "../../../components/cards/ProjectCard";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import {
    FolderKanban,
    Plus,
    Search,
    X,
    Star,
    ArrowUp,
    ArrowDown,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
} from "lucide-react";

const sortProjectsByHierarchy = (list) =>
    [...list].sort((a, b) => {
        if (Boolean(a.featured) !== Boolean(b.featured)) {
            return a.featured ? -1 : 1;
        }
        const orderA = Number(a.order) > 0 ? Number(a.order) : Number.MAX_SAFE_INTEGER;
        const orderB = Number(b.order) > 0 ? Number(b.order) : Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

const ProjectList = ({ projects = [], onProjectsChange, onDelete, onRefresh }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [confirmState, setConfirmState] = useState({ open: false, project: null, loading: false });
    const [busyId, setBusyId] = useState(null);

    const query = searchParams.get("q") || "";
    const category = searchParams.get("cat") || "All";
    const visibility = searchParams.get("vis") || "all";
    const isFiltered = Boolean(query.trim()) || category !== "All" || visibility !== "all";

    const updateFilter = (newQuery, newCat, newVis) => {
        const params = new URLSearchParams(searchParams);
        if (newQuery !== undefined) {
            if (newQuery.trim()) params.set("q", newQuery);
            else params.delete("q");
        }
        if (newCat !== undefined) {
            if (newCat && newCat !== "All") params.set("cat", newCat);
            else params.delete("cat");
        }
        if (newVis !== undefined) {
            if (newVis && newVis !== "all") params.set("vis", newVis);
            else params.delete("vis");
        }
        setSearchParams(params, { replace: true });
    };

    const categories = useMemo(() => {
        const cats = new Set(["All"]);
        projects.forEach((p) => { if (p.category) cats.add(p.category); });
        return Array.from(cats);
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            const matchesQuery =
                !query ||
                p.title?.toLowerCase().includes(query.toLowerCase()) ||
                p.shortDescription?.toLowerCase().includes(query.toLowerCase()) ||
                p.technologies?.some((t) => t.toLowerCase().includes(query.toLowerCase()));
            const matchesCategory = category === "All" || p.category === category;
            const isPub = p.isPublished !== false;
            const matchesVis =
                visibility === "all" ||
                (visibility === "live" && isPub) ||
                (visibility === "draft" && !isPub);
            return matchesQuery && matchesCategory && matchesVis;
        });
    }, [projects, query, category, visibility]);

    const handleToggleFeatured = async (project) => {
        const nextFeatured = !project.featured;
        const previous = projects;

        // Optimistic update + re-sort
        const optimistic = sortProjectsByHierarchy(
            projects.map((p) => (p._id === project._id ? { ...p, featured: nextFeatured } : p))
        );
        onProjectsChange?.(optimistic);
        setBusyId(project._id);

        try {
            await api.put(`/admin/dashboard/projects/${project._id}`, { featured: nextFeatured });
            toast.success(
                nextFeatured ? `"${project.title}" pinned to Home.` : `"${project.title}" unpinned.`
            );
        } catch {
            onProjectsChange?.(previous);
            toast.error("Failed to update featured status.");
        } finally {
            setBusyId(null);
        }
    };

    const handleTogglePublished = async (project) => {
        const currentPublished = project.isPublished !== false;
        const nextPublished = !currentPublished;
        const previous = projects;

        const optimistic = projects.map((p) =>
            p._id === project._id ? { ...p, isPublished: nextPublished } : p
        );
        onProjectsChange?.(optimistic);
        setBusyId(project._id);

        try {
            await api.put(`/admin/dashboard/projects/${project._id}`, { isPublished: nextPublished });
            toast.success(
                nextPublished ? `"${project.title}" published.` : `"${project.title}" moved to Drafts.`
            );
        } catch {
            onProjectsChange?.(previous);
            toast.error("Failed to update visibility.");
        } finally {
            setBusyId(null);
        }
    };

    const handleMove = async (index, direction) => {
        if (isFiltered) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= projects.length) return;

        // Keep featured and standard groups contiguous when moving
        if (Boolean(projects[index].featured) !== Boolean(projects[targetIndex].featured)) {
            toast.info("Featured projects always appear above standard projects. Pin or unpin to move between groups.");
            return;
        }

        const previous = projects;
        const reordered = [...projects];
        const [moved] = reordered.splice(index, 1);
        reordered.splice(targetIndex, 0, moved);

        const withOrder = reordered.map((p, idx) => ({ ...p, order: idx + 1 }));
        onProjectsChange?.(withOrder);
        setBusyId(moved._id);

        try {
            await api.patch("/admin/dashboard/projects/reorder", {
                orderedIds: withOrder.map((p) => p._id),
            });
        } catch {
            onProjectsChange?.(previous);
            toast.error("Failed to save project order.");
            onRefresh?.();
        } finally {
            setBusyId(null);
        }
    };

    const requestDelete = (p) => {
        setConfirmState({ open: true, project: p, loading: false });
    };

    const handleConfirmDelete = async () => {
        setConfirmState((s) => ({ ...s, loading: true }));
        try {
            await api.delete(`/admin/dashboard/projects/${confirmState.project._id}`);
            toast.success(`"${confirmState.project.title}" deleted.`);
            onDelete?.();
        } catch {
            toast.error("Failed to delete project. Please try again.");
        } finally {
            setConfirmState({ open: false, project: null, loading: false });
        }
    };

    return (
        <>
            <ConfirmDialog
                open={confirmState.open}
                title="Delete project?"
                message={`"${confirmState.project?.title}" will be permanently removed from your portfolio. This cannot be undone.`}
                confirmLabel="Delete Project"
                loading={confirmState.loading}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmState({ open: false, project: null, loading: false })}
            />

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cream">Projects</h1>
                    <p className="mt-1.5 text-sm text-stone-400">
                        Manage, pin, and reorder the projects shown on your portfolio.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/mod/projects/new")}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                    <Plus size={15} />
                    Add Project
                </button>
            </div>

            {/* URL Search Params Controls */}
            {projects.length > 0 && (
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input
                            type="text"
                            placeholder="Filter by title, description or tech…"
                            value={query}
                            onChange={(e) => updateFilter(e.target.value, undefined)}
                            className="w-full rounded-lg border border-stone-700/70 bg-stone-900 py-2 pl-9 pr-8 text-xs text-cream placeholder-stone-500 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                        />
                        {query && (
                            <button
                                onClick={() => updateFilter("", undefined)}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-stone-500 hover:text-stone-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1 rounded-lg border border-stone-800 bg-stone-900/60 p-0.5">
                            {[
                                { value: "all", label: "All" },
                                { value: "live", label: "Live" },
                                { value: "draft", label: "Drafts" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => updateFilter(undefined, undefined, opt.value)}
                                    className={`rounded-md px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                                        visibility === opt.value
                                            ? "bg-stone-700 text-cream font-medium"
                                            : "text-stone-400 hover:text-cream"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {categories.length > 1 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => updateFilter(undefined, cat)}
                                        className={`rounded-md px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
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
                </div>
            )}

            {/* Count badge */}
            {projects.length > 0 && (
                <p className="mb-4 text-xs text-stone-500">
                    Showing {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}
                    {isFiltered && " (clear filters to reorder)"}
                </p>
            )}

            {/* List */}
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-700/60 bg-stone-900/40 py-16 text-center">
                    <FolderKanban size={32} className="mb-3 text-stone-600" />
                    <p className="text-base font-semibold text-stone-400">No projects yet</p>
                    <p className="mt-1 text-sm text-stone-600">Add your first project to populate the portfolio.</p>
                    <button
                        onClick={() => navigate("/mod/projects/new")}
                        className="mt-5 flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                    >
                        <Plus size={14} /> Add Project
                    </button>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-12 text-center text-stone-500">
                    <p className="text-sm">No projects matching your search criteria.</p>
                    <button
                        onClick={() => updateFilter("", "All", "all")}
                        className="mt-2 rounded text-xs text-crimson hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                    >
                        Clear search filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {filteredProjects.map((p, i) => {
                        const isFirst = i === 0;
                        const isLast = i === filteredProjects.length - 1;
                        const isBusy = busyId === p._id;

                        return (
                            <div key={p._id} className="flex flex-col gap-2">
                                {/* Hierarchy & Quick Action Bar */}
                                <div className="flex items-center justify-between gap-2 rounded-xl border border-stone-800/80 bg-stone-900/70 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-semibold tabular-nums text-stone-400">
                                            #{(i + 1).toString().padStart(2, "0")}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            onClick={() => handleToggleFeatured(p)}
                                            aria-pressed={Boolean(p.featured)}
                                            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50 ${
                                                p.featured
                                                    ? "border-amber-600/50 bg-amber-950/40 text-amber-300"
                                                    : "border-stone-700/60 bg-stone-900 text-stone-400 hover:border-stone-600 hover:text-cream"
                                            }`}
                                        >
                                            <Star
                                                size={12}
                                                className={p.featured ? "fill-amber-400 text-amber-400" : "text-stone-500"}
                                            />
                                            {p.featured ? "Featured" : "Pin"}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            onClick={() => handleTogglePublished(p)}
                                            aria-pressed={p.isPublished !== false}
                                            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50 ${
                                                p.isPublished === false
                                                    ? "border-stone-700 bg-stone-950 text-stone-400"
                                                    : "border-emerald-800/50 bg-emerald-950/30 text-emerald-300"
                                            }`}
                                        >
                                            {p.isPublished === false ? <EyeOff size={12} /> : <Eye size={12} />}
                                            {p.isPublished === false ? "Draft" : "Live"}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {!isFiltered && (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={isFirst || isBusy}
                                                    onClick={() => handleMove(i, -1)}
                                                    aria-label={`Move ${p.title} up`}
                                                    className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isLast || isBusy}
                                                    onClick={() => handleMove(i, 1)}
                                                    aria-label={`Move ${p.title} down`}
                                                    className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/mod/projects/${p._id}`)}
                                            aria-label={`Edit ${p.title}`}
                                            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => requestDelete(p)}
                                            aria-label={`Delete ${p.title}`}
                                            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-950/40 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <ProjectCard
                                    project={p}
                                    isAdmin
                                    onEdit={() => navigate(`/mod/projects/${p._id}`)}
                                    onDelete={() => requestDelete(p)}
                                    index={i}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default ProjectList;
