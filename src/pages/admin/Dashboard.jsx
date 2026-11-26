import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import usePageSEO from "../../hooks/usePageSEO";
import api from "../../services/api";
import { FolderKanban, Wrench, UserCircle, ArrowRight, Activity } from "lucide-react";

const CARDS = [
    {
        to: "/mod/projects",
        icon: FolderKanban,
        label: "Manage Projects",
        desc: "Add, edit, and remove portfolio projects displayed publicly.",
        statKey: "projects",
        color: "text-blue-400",
        glow: "group-hover:shadow-blue-900/20",
    },
    {
        to: "/mod/skills",
        icon: Wrench,
        label: "Manage Skills",
        desc: "Update skill names, categories, and proficiency levels.",
        statKey: "skills",
        color: "text-emerald-400",
        glow: "group-hover:shadow-emerald-900/20",
    },
    {
        to: "/mod/profile",
        icon: UserCircle,
        label: "Edit Profile",
        desc: "Maintain hero content, contact info, resume URL, and social links.",
        statKey: null,
        color: "text-crimson",
        glow: "group-hover:shadow-red-900/20",
    },
    {
        to: "/mod/audit-log",
        icon: Activity,
        label: "Activity Log",
        desc: "Review every content change recorded by the CMS in real time.",
        statKey: "logs",
        color: "text-amber-400",
        glow: "group-hover:shadow-amber-900/20",
    },
];

const Dashboard = () => {
    usePageSEO({
        title: "Admin Dashboard",
        description: "Admin content management dashboard.",
        noindex: true,
    });

    const navigate = useNavigate();
    const [stats, setStats] = useState({
        projects: null,
        drafts: 0,
        skills: null,
        logs: null,
        failedLogins: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [proj, skill, log, sec] = await Promise.all([
                    api.get("/admin/dashboard/projects"),
                    api.get("/admin/dashboard/skills"),
                    api.get("/admin/audit-log?paginated=true&limit=1"),
                    api.get("/admin/audit-log?paginated=true&limit=20&entity=Security"),
                ]);
                const allProjects = Array.isArray(proj.data) ? proj.data : [];
                const draftCount = allProjects.filter((p) => p.isPublished === false).length;
                const secLogs = Array.isArray(sec.data?.logs) ? sec.data.logs : [];
                const recentFails = secLogs.filter((l) => l.action === "LOGIN_FAILED").length;

                setStats({
                    projects: allProjects.length,
                    drafts: draftCount,
                    skills: Array.isArray(skill.data) ? skill.data.length : 0,
                    logs: log.data?.total ?? 0,
                    failedLogins: recentFails,
                });
            } catch {
                // Stats are non-critical — fail silently
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-cream">Dashboard</h1>
                <p className="mt-1.5 text-sm text-stone-400">
                    Manage portfolio content, profile details, and public-facing updates.
                </p>
            </div>

            {/* Nav cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {CARDS.map(({ to, icon: Icon, label, desc, statKey, color, glow }) => (
                    <button
                        key={to}
                        onClick={() => navigate(to)}
                        className={`group relative flex flex-col gap-4 rounded-xl border border-stone-800/70 bg-stone-900/60 p-6 text-left transition-[transform,border-color,box-shadow] duration-200 motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:border-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:scale-[0.99] motion-reduce:active:scale-100 ${glow}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border border-stone-700/50 bg-stone-800 ${color}`}>
                                <Icon size={18} />
                            </div>
                            {statKey && stats[statKey] !== null && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`font-mono text-2xl font-bold tabular-nums ${color}`}>
                                        {stats[statKey]}
                                    </span>
                                    {statKey === "projects" && stats.drafts > 0 && (
                                        <span className="text-xs text-stone-400">
                                            {stats.drafts} {stats.drafts === 1 ? "draft" : "drafts"}
                                        </span>
                                    )}
                                    {statKey === "logs" && stats.failedLogins > 0 && (
                                        <span className="text-xs text-red-400">
                                            {stats.failedLogins} failed {stats.failedLogins === 1 ? "login" : "logins"}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-base font-semibold text-cream">{label}</h2>
                            <p className="mt-1 text-sm leading-relaxed text-stone-500">{desc}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-stone-500 transition-colors group-hover:text-stone-300">
                            Open <ArrowRight size={12} className="transition-transform motion-reduce:transition-none group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
