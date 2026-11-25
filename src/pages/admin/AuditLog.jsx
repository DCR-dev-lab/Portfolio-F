import { useEffect, useState } from "react";
import api from "../../services/api";
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
} from "lucide-react";

/* ── Action metadata ──────────────────────────────────────── */
const ACTION_META = {
    CREATE_PROJECT:   { label: "Project created",   icon: Plus,        color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-800/40" },
    UPDATE_PROJECT:   { label: "Project updated",   icon: Pencil,      color: "text-blue-400",    bg: "bg-blue-950/40 border-blue-800/40" },
    DELETE_PROJECT:   { label: "Project deleted",   icon: X,           color: "text-red-400",     bg: "bg-red-950/40 border-red-800/40" },
    REORDER_PROJECTS: { label: "Projects reordered", icon: ArrowUpDown, color: "text-amber-400",   bg: "bg-amber-950/40 border-amber-800/40" },
    CREATE_SKILL:     { label: "Skill created",     icon: Plus,        color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-800/40" },
    UPDATE_SKILL:     { label: "Skill updated",     icon: Pencil,      color: "text-blue-400",    bg: "bg-blue-950/40 border-blue-800/40" },
    DELETE_SKILL:     { label: "Skill deleted",     icon: X,           color: "text-red-400",     bg: "bg-red-950/40 border-red-800/40" },
    UPDATE_PROFILE:   { label: "Profile updated",   icon: UserCircle,  color: "text-amber-400",   bg: "bg-amber-950/40 border-amber-800/40" },
    CLEAR_AUDIT_LOGS: { label: "Audit log cleared", icon: Trash2,      color: "text-red-400",     bg: "bg-red-950/40 border-red-800/40" },
};

const ENTITY_ICON = {
    Project: FolderKanban,
    Skill:   Wrench,
    Profile: UserCircle,
    AuditLog: Activity,
};

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

/* ───────────────────────────────────────────────────────── */
const AuditLogViewer = () => {
    const [logs, setLogs]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [clearing, setClearing] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/admin/audit-log?limit=100");
            setLogs(res.data);
        } catch {
            setError("Failed to load activity log.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const handleClear = async () => {
        if (!window.confirm("Clear all audit log entries? This cannot be undone.")) return;
        setClearing(true);
        try {
            await api.delete("/admin/audit-log");
            setLogs([]);
        } catch {
            setError("Failed to clear log.");
        } finally {
            setClearing(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-cream">Activity Log</h1>
                    <p className="mt-1.5 text-sm text-stone-400">
                        Every content change recorded in real time.
                    </p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-stone-700/70 px-3 py-2 text-sm text-stone-400 transition-colors hover:border-stone-600 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin motion-reduce:animate-none" : ""} />
                        Refresh
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={clearing || logs.length === 0}
                        className="flex items-center gap-2 rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-950/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                        Clear
                    </button>
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
                        <div key={i} className="h-14 animate-pulse motion-reduce:animate-none rounded-xl bg-stone-900/60" />
                    ))}
                </div>
            )}

            {!loading && logs.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-700/60 bg-stone-900/40 py-16 text-center">
                    <Activity size={28} className="mb-3 text-stone-600" />
                    <p className="text-base font-semibold text-stone-400">No activity yet</p>
                    <p className="mt-1 text-sm text-stone-600">
                        Actions like creating or deleting projects will appear here.
                    </p>
                </div>
            )}

            {!loading && logs.length > 0 && (
                <div className="space-y-2">
                    {logs.map((log) => {
                        const meta = ACTION_META[log.action] || {
                            label: log.action,
                            icon: Activity,
                            color: "text-stone-400",
                            bg: "bg-stone-900/40 border-stone-800/40",
                        };
                        const ActionIcon = meta.icon;
                        const EntityIcon = ENTITY_ICON[log.entity] || Activity;

                        return (
                            <div
                                key={log._id}
                                className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${meta.bg}`}
                            >
                                {/* Action icon */}
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900/60 ${meta.color}`}>
                                    <ActionIcon size={14} />
                                </div>

                                {/* Info */}
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                                        {log.entityName && (
                                            <span className="truncate text-sm text-cream">
                                                : {log.entityName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-stone-600">
                                        <EntityIcon size={11} />
                                        <span>{log.entity}</span>
                                        {log.entityId && (
                                            <span className="font-mono opacity-50">#{log.entityId.slice(-6)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Time */}
                                <span className="shrink-0 text-xs text-stone-600">
                                    {formatRelative(log.createdAt)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && logs.length > 0 && (
                <p className="mt-4 text-center text-xs text-stone-700">
                    Showing {logs.length} most recent entries
                </p>
            )}
        </div>
    );
};

export default AuditLogViewer;
