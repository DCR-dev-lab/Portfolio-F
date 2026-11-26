import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import usePageSEO from "../../hooks/usePageSEO";
import {
    Activity,
    Trash2,
    RefreshCw,
    FolderKanban,
    Wrench,
    UserCircle,
    Plus,
    Pencil,
    X,
    AlertCircle,
    ArrowUpDown,
    ShieldAlert,
    ShieldCheck,
    LogOut,
    RotateCcw,
    ChevronDown,
    Search,
    ArrowRight,
    ExternalLink,
    Undo2,
} from "lucide-react";

/* ── 5 Unique Vibrant Category Color Themes (no purple) ───── */
const CATEGORY_THEME = {
    Project:  { text: "text-blue-400",  bg: "bg-blue-950/45 border-blue-600/60",   tabActive: "border border-blue-500/70 bg-blue-950/60 text-blue-300",   dot: "bg-blue-400" },
    Skill:    { text: "text-amber-400", bg: "bg-amber-950/45 border-amber-500/65", tabActive: "border border-amber-500/70 bg-amber-950/60 text-amber-300", dot: "bg-amber-400" },
    Profile:  { text: "text-cream",     bg: "bg-stone-800/55 border-stone-400/50", tabActive: "border border-stone-400/70 bg-stone-800 text-cream",          dot: "bg-cream" },
    Revert:   { text: "text-cyan-400",  bg: "bg-cyan-950/45 border-cyan-600/60",   tabActive: "border border-cyan-500/70 bg-cyan-950/60 text-cyan-300",   dot: "bg-cyan-400" },
    Security: { text: "text-red-400",   bg: "bg-red-950/50 border-red-600/65",     tabActive: "border border-red-500/70 bg-red-950/60 text-red-300",      dot: "bg-red-400" },
    AuditLog: { text: "text-stone-400", bg: "bg-stone-900/60 border-stone-700/60", tabActive: "bg-stone-700 text-cream",                                  dot: "bg-stone-400" },
};

/* ── Action metadata ──────────────────────────────────────── */
const ACTION_META = {
    CREATE_PROJECT:   { label: "Project created",    icon: Plus,        ...CATEGORY_THEME.Project },
    UPDATE_PROJECT:   { label: "Project updated",    icon: Pencil,      ...CATEGORY_THEME.Project },
    DELETE_PROJECT:   { label: "Project deleted",    icon: X,           ...CATEGORY_THEME.Project, iconColor: "text-red-400" },
    RESTORE_PROJECT:  { label: "Project restored",   icon: RotateCcw,   ...CATEGORY_THEME.Project, iconColor: "text-emerald-400" },
    REVERT_PROJECT:   { label: "Project reverted",   icon: Undo2,       ...CATEGORY_THEME.Revert },
    REORDER_PROJECTS: { label: "Projects reordered", icon: ArrowUpDown, ...CATEGORY_THEME.Project },
    CREATE_SKILL:     { label: "Skill created",      icon: Plus,        ...CATEGORY_THEME.Skill },
    UPDATE_SKILL:     { label: "Skill updated",      icon: Pencil,      ...CATEGORY_THEME.Skill },
    DELETE_SKILL:     { label: "Skill deleted",      icon: X,           ...CATEGORY_THEME.Skill, iconColor: "text-red-400" },
    RESTORE_SKILL:    { label: "Skill restored",     icon: RotateCcw,   ...CATEGORY_THEME.Skill, iconColor: "text-emerald-400" },
    REVERT_SKILL:     { label: "Skill reverted",     icon: Undo2,       ...CATEGORY_THEME.Revert },
    UPDATE_PROFILE:   { label: "Profile updated",    icon: UserCircle,  ...CATEGORY_THEME.Profile },
    REVERT_PROFILE:   { label: "Profile reverted",   icon: Undo2,       ...CATEGORY_THEME.Revert },
    LOGIN_SUCCESS:    { label: "Mod login",          icon: ShieldCheck, text: "text-emerald-400", bg: "bg-emerald-950/45 border-emerald-600/60" },
    LOGIN_FAILED:     { label: "Failed login",       icon: ShieldAlert, text: "text-red-400",     bg: "bg-red-950/55 border-red-600/70" },
    LOGOUT:           { label: "Mod logout",         icon: LogOut,      text: "text-rose-400",    bg: "bg-rose-950/45 border-rose-600/60" },
    CLEAR_AUDIT_LOGS: { label: "Audit log cleared",  icon: Trash2,      ...CATEGORY_THEME.AuditLog, iconColor: "text-red-400" },
};

const ENTITY_ICON = {
    Project:  FolderKanban,
    Skill:    Wrench,
    Profile:  UserCircle,
    Security: ShieldCheck,
    AuditLog: Activity,
};

const FILTER_TABS = [
    { value: "All",      label: "All" },
    { value: "Project",  label: "Projects" },
    { value: "Skill",    label: "Skills" },
    { value: "Profile",  label: "Profile" },
    { value: "Revert",   label: "Reverts" },
    { value: "Security", label: "Security" },
];

const formatRelative = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
};

const parseClientSummary = (ua = "") => {
    if (!ua || ua === "unknown") return null;
    const browser =
        ua.includes("Edg/") ? "Edge" :
        ua.includes("Chrome/") ? "Chrome" :
        ua.includes("Firefox/") ? "Firefox" :
        ua.includes("Safari/") ? "Safari" :
        ua.includes("curl") ? "curl" : "Client";
    const os =
        ua.includes("Windows") ? "Windows" :
        ua.includes("Mac OS") ? "macOS" :
        ua.includes("Android") ? "Android" :
        ua.includes("iPhone") || ua.includes("iPad") ? "iOS" :
        ua.includes("Linux") ? "Linux" : "";
    return os ? `${browser} on ${os}` : browser;
};

const getEntityLink = (log) => {
    if (log.entity === "Profile") return "/mod/profile";

    const isDeleted = log.action === "DELETE_PROJECT" || log.action === "DELETE_SKILL";
    const targetId = isDeleted ? log.details?.restoredEntityId : log.entityId;
    if (!targetId) return null;

    if (log.entity === "Project") return `/mod/projects/${targetId}`;
    if (log.entity === "Skill") return `/mod/skills/${targetId}`;
    return null;
};

/* ───────────────────────────────────────────────────────── */
const AuditLogViewer = () => {
    usePageSEO({
        title: "Activity Log | Mod Studio",
        description: "CMS audit and security activity log.",
        noindex: true,
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [clearing, setClearing] = useState(false);
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);
    const [restoringId, setRestoringId] = useState(null);
    const [revertingId, setRevertingId] = useState(null);
    const [expandedIds, setExpandedIds] = useState(() => new Set());

    const activeEntity = searchParams.get("entity") || "All";
    const query = searchParams.get("q") || "";

    const updateFilter = (newEntity, newQuery) => {
        const params = new URLSearchParams(searchParams);
        if (newEntity !== undefined) {
            if (newEntity && newEntity !== "All") params.set("entity", newEntity);
            else params.delete("entity");
        }
        if (newQuery !== undefined) {
            if (newQuery.trim()) params.set("q", newQuery);
            else params.delete("q");
        }
        setSearchParams(params, { replace: true });
    };

    const fetchLogs = async (skip = 0, append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError("");
        try {
            const res = await api.get("/admin/audit-log", {
                params: {
                    paginated: "true",
                    limit: 40,
                    skip,
                    entity: activeEntity,
                },
            });
            const { logs: fetched = [], hasMore: more = false, total: count = 0 } = res.data;
            setLogs((prev) => (append ? [...prev, ...fetched] : fetched));
            setHasMore(more);
            setTotal(count);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load activity log.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchLogs(0, false);
    }, [activeEntity]);

    const filteredLogs = useMemo(() => {
        const q = query.trim().toLowerCase();
        return logs.filter((log) => {
            const matchesEntity =
                activeEntity === "All" ||
                (activeEntity === "Revert" ? log.action?.startsWith("REVERT_") : log.entity === activeEntity);
            if (!matchesEntity) return false;
            if (!q) return true;
            const metaLabel = (ACTION_META[log.action]?.label || log.action).toLowerCase();
            const changesText = (log.details?.changes || [])
                .map((c) => `${c.field} ${c.from} ${c.to}`)
                .join(" ")
                .toLowerCase();
            return (
                metaLabel.includes(q) ||
                (log.entityName || "").toLowerCase().includes(q) ||
                (log.details?.ip || "").toLowerCase().includes(q) ||
                changesText.includes(q)
            );
        });
    }, [logs, activeEntity, query]);

    const toggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleRestore = async (log) => {
        setRestoringId(log._id);
        try {
            const res = await api.post(`/admin/audit-log/${log._id}/restore`);
            toast.success(`${log.entity} "${log.entityName}" restored.`);
            setLogs((prev) =>
                prev.map((item) => (item._id === log._id ? res.data.log : item))
            );
            fetchLogs(0, false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to restore item.");
        } finally {
            setRestoringId(null);
        }
    };

    const handleRevert = async (log) => {
        setRevertingId(log._id);
        try {
            const res = await api.post(`/admin/audit-log/${log._id}/revert`);
            toast.success(`${log.entity} reverted to previous values.`);
            setLogs((prev) =>
                prev.map((item) => (item._id === log._id ? res.data.log : item))
            );
            fetchLogs(0, false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to revert update.");
        } finally {
            setRevertingId(null);
        }
    };

    const handleConfirmClear = async () => {
        setClearing(true);
        try {
            await api.delete("/admin/audit-log");
            toast.success("Activity log cleared.");
            setConfirmClearOpen(false);
            fetchLogs(0, false);
        } catch {
            toast.error("Failed to clear log.");
            setError("Failed to clear log.");
        } finally {
            setClearing(false);
        }
    };

    return (
        <div>
            <ConfirmDialog
                open={confirmClearOpen}
                title="Clear activity log?"
                message="All recorded history, diffs, and deleted item snapshots will be permanently removed. This cannot be undone."
                confirmLabel="Clear All"
                loading={clearing}
                onConfirm={handleConfirmClear}
                onCancel={() => setConfirmClearOpen(false)}
            />

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cream">Activity Log</h1>
                    <p className="mt-1.5 text-sm text-stone-400">
                        Field diffs, security sign-ins, and one-click restore for deleted items.
                    </p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <button
                        onClick={() => fetchLogs(0, false)}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-stone-700/70 px-3 py-2 text-sm text-stone-400 transition-colors hover:border-stone-600 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin motion-reduce:animate-none" : ""} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setConfirmClearOpen(true)}
                        disabled={clearing || logs.length === 0}
                        className="flex items-center gap-2 rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-950/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter activity by category">
                    {FILTER_TABS.map(({ value, label }) => {
                        const active = activeEntity === value;
                        const theme = CATEGORY_THEME[value];
                        const activeClass = theme ? theme.tabActive : "border border-stone-600 bg-stone-700 text-cream";
                        return (
                            <button
                                key={value}
                                role="tab"
                                aria-selected={active}
                                onClick={() => updateFilter(value, undefined)}
                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 ${
                                    active
                                        ? activeClass
                                        : "border border-transparent text-stone-400 hover:bg-stone-800 hover:text-cream"
                                }`}
                            >
                                {theme && <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden="true" />}
                                {label}
                            </button>
                        );
                    })}
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                        type="text"
                        placeholder="Search item, field, or IP…"
                        value={query}
                        onChange={(e) => updateFilter(undefined, e.target.value)}
                        className="w-full rounded-lg border border-stone-700/70 bg-stone-900 py-2 pl-9 pr-8 text-xs text-cream placeholder-stone-500 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                    />
                    {query && (
                        <button
                            onClick={() => updateFilter(undefined, "")}
                            aria-label="Clear search"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-stone-500 hover:text-stone-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {loading && (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse motion-reduce:animate-none rounded-xl bg-stone-900/60" />
                    ))}
                </div>
            )}

            {!loading && filteredLogs.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-700/60 bg-stone-900/40 py-16 text-center">
                    <Activity size={28} className="mb-3 text-stone-600" />
                    <p className="text-base font-semibold text-stone-400">
                        {logs.length === 0 ? "No activity yet" : "No matching activity"}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                        {logs.length === 0
                            ? "Content edits, deletions, and sign-ins will appear here."
                            : "Try clearing your search or category filter."}
                    </p>
                    {logs.length > 0 && (
                        <button
                            onClick={() => updateFilter("All", "")}
                            className="mt-3 rounded text-xs text-crimson hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            )}

            {!loading && filteredLogs.length > 0 && (
                <div className="space-y-2.5">
                    {filteredLogs.map((log) => {
                        const meta = ACTION_META[log.action] || {
                            label: log.action,
                            icon: Activity,
                            text: "text-stone-400",
                            bg: "bg-stone-900/40 border-stone-800/40",
                        };
                        const ActionIcon = meta.icon;
                        const EntityIcon = ENTITY_ICON[log.entity] || Activity;
                        const labelColor = meta.text;
                        const iconColor = meta.iconColor || meta.text;
                        const changes = Array.isArray(log.details?.changes) ? log.details.changes : [];
                        const hasChanges = changes.length > 0;
                        const isExpanded = expandedIds.has(log._id);
                        const canRestore = Boolean(
                            log.details?.snapshot &&
                            !log.details?.restoredAt &&
                            (log.action === "DELETE_PROJECT" || log.action === "DELETE_SKILL")
                        );
                        const wasRestored = Boolean(log.details?.restoredAt);
                        const canRevert = Boolean(
                            log.details?.previousValues &&
                            !log.details?.revertedAt &&
                            (log.action.startsWith("UPDATE_") || log.action.startsWith("REVERT_"))
                        );
                        const wasReverted = Boolean(log.details?.revertedAt);
                        const entityLink = getEntityLink(log);
                        const clientSummary = parseClientSummary(log.details?.userAgent);
                        const exactTime = new Date(log.createdAt).toLocaleString();

                        return (
                            <div
                                key={log._id}
                                className={`rounded-xl border px-4 py-3 ${meta.bg}`}
                            >
                                <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
                                    {/* Action icon */}
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900/60 ${iconColor}`}>
                                        <ActionIcon size={14} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                            <span className={`text-sm font-medium ${labelColor}`}>{meta.label}</span>
                                            {log.entityName && (
                                                entityLink ? (
                                                    <Link
                                                        to={entityLink}
                                                        className="inline-flex items-center gap-1 truncate rounded text-sm text-cream hover:text-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                                                    >
                                                        <span>: {log.entityName}</span>
                                                        <ExternalLink size={11} className="shrink-0 text-stone-500" />
                                                    </Link>
                                                ) : (
                                                    <span className="truncate text-sm text-cream">
                                                        : {log.entityName}
                                                    </span>
                                                )
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-500">
                                            <span className="inline-flex items-center gap-1">
                                                <EntityIcon size={11} />
                                                {log.entity}
                                            </span>
                                            {log.entityId && (
                                                <span className="font-mono text-stone-600">#{log.entityId.slice(-6)}</span>
                                            )}
                                            {log.details?.ip && (
                                                <span className="font-mono text-stone-400">IP {log.details.ip}</span>
                                            )}
                                            {clientSummary && (
                                                <span className="text-stone-500">{clientSummary}</span>
                                            )}
                                            {wasRestored && (
                                                <span className="text-emerald-400">
                                                    Restored {formatRelative(log.details.restoredAt)}
                                                </span>
                                            )}
                                            {wasReverted && (
                                                <span className="text-cyan-400">
                                                    Reverted {formatRelative(log.details.revertedAt)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions & Timestamp */}
                                    <div className="flex shrink-0 items-center gap-2">
                                        {hasChanges && (
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(log._id)}
                                                aria-expanded={isExpanded}
                                                className="inline-flex items-center gap-1 rounded-md border border-stone-700/70 bg-stone-900/70 px-2.5 py-1 text-xs font-medium text-stone-300 transition-colors hover:border-stone-600 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                                            >
                                                <span>{changes.length} {changes.length === 1 ? "change" : "changes"}</span>
                                                <ChevronDown
                                                    size={12}
                                                    className={`transition-transform duration-150 motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
                                                />
                                            </button>
                                        )}

                                        {canRevert && (
                                            <button
                                                type="button"
                                                disabled={revertingId === log._id}
                                                onClick={() => handleRevert(log)}
                                                className="inline-flex items-center gap-1.5 rounded-md border border-cyan-700/60 bg-cyan-950/40 px-2.5 py-1 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50"
                                            >
                                                <Undo2
                                                    size={12}
                                                    className={revertingId === log._id ? "animate-spin motion-reduce:animate-none" : ""}
                                                />
                                                {revertingId === log._id ? "Reverting…" : "Revert"}
                                            </button>
                                        )}

                                        {canRestore && (
                                            <button
                                                type="button"
                                                disabled={restoringId === log._id}
                                                onClick={() => handleRestore(log)}
                                                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700/60 bg-emerald-950/50 px-2.5 py-1 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50"
                                            >
                                                <RotateCcw
                                                    size={12}
                                                    className={restoringId === log._id ? "animate-spin motion-reduce:animate-none" : ""}
                                                />
                                                {restoringId === log._id ? "Restoring…" : "Restore"}
                                            </button>
                                        )}

                                        <time
                                            dateTime={log.createdAt}
                                            title={exactTime}
                                            className="cursor-help text-xs text-stone-500"
                                        >
                                            {formatRelative(log.createdAt)}
                                        </time>
                                    </div>
                                </div>

                                {/* Expandable Field-Level Diffs */}
                                {hasChanges && isExpanded && (
                                    <div className="mt-3 space-y-1.5 border-t border-stone-800/70 pt-3">
                                        {changes.map((c, idx) => (
                                            <div
                                                key={`${c.field}-${idx}`}
                                                className="flex flex-col gap-1 rounded-lg bg-stone-950/60 px-3 py-2 text-xs sm:flex-row sm:items-center sm:gap-3"
                                            >
                                                <span className="font-mono font-medium text-stone-300 sm:w-40 sm:shrink-0">
                                                    {c.field}
                                                </span>
                                                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                                    <span className="max-w-full whitespace-pre-wrap break-words rounded bg-red-950/50 px-1.5 py-0.5 text-red-300 line-through decoration-red-400/60">
                                                        {c.from}
                                                    </span>
                                                    <ArrowRight size={11} className="shrink-0 text-stone-600" aria-hidden="true" />
                                                    <span className="max-w-full whitespace-pre-wrap break-words rounded bg-emerald-950/50 px-1.5 py-0.5 text-emerald-300">
                                                        {c.to}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filteredLogs.length > 0 && (
                <div className="mt-6 flex flex-col items-center gap-3">
                    {hasMore && (
                        <button
                            type="button"
                            disabled={loadingMore}
                            onClick={() => fetchLogs(logs.length, true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-stone-700/70 bg-stone-900 px-5 py-2 text-xs font-medium text-stone-300 transition-colors hover:border-stone-600 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={loadingMore ? "animate-spin motion-reduce:animate-none" : ""} />
                            {loadingMore ? "Loading more…" : `Load more (${total - logs.length} remaining)`}
                        </button>
                    )}
                    <p className="text-center text-xs text-stone-600">
                        Showing {filteredLogs.length} of {total || logs.length} entries
                    </p>
                </div>
            )}
        </div>
    );
};

export default AuditLogViewer;
