import { useState } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Toaster } from "sonner";
import api from "../../services/api";
import { UnsavedChangesProvider, useUnsavedContext } from "../../context/UnsavedChangesContext";
import {
    LayoutDashboard,
    FolderKanban,
    Wrench,
    UserCircle,
    Activity,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
    { to: "/mod/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/mod/projects", icon: FolderKanban, label: "Projects" },
    { to: "/mod/skills", icon: Wrench, label: "Skills" },
    { to: "/mod/profile", icon: UserCircle, label: "Profile" },
    { to: "/mod/audit-log", icon: Activity, label: "Activity Log" },
];

const AdminShell = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const { confirmNavigation } = useUnsavedContext();

    const handleNavClick = (e, to) => {
        if (location.pathname === to) {
            setSidebarOpen(false);
            return;
        }
        e.preventDefault();
        confirmNavigation(() => {
            setSidebarOpen(false);
            navigate(to);
        });
    };

    const handleLogout = () => {
        confirmNavigation(async () => {
            setLoggingOut(true);
            try {
                await api.post("/admin/logout");
            } catch {
                // Even if token already expired, still clear local session
            } finally {
                Cookies.remove("adminToken");
                setLoggingOut(false);
                navigate("/mod/login");
            }
        });
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Brand */}
            <div className="flex items-center gap-3 border-b border-stone-800 px-6 py-5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-crimson">
                    <span className="text-xs font-bold text-white">M</span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-cream">Mod Studio</p>
                    <p className="text-xs text-stone-500">Portfolio CMS</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={(e) => handleNavClick(e, to)}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 ${
                                isActive
                                    ? "bg-crimson/15 text-crimson"
                                    : "text-stone-400 hover:bg-stone-800 hover:text-cream"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    size={16}
                                    className={isActive ? "text-crimson" : "text-stone-500 group-hover:text-cream"}
                                />
                                <span>{label}</span>
                                {isActive && (
                                    <ChevronRight size={12} className="ml-auto text-crimson" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer actions */}
            <div className="space-y-1 border-t border-stone-800 px-3 py-4">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                >
                    <span>View Live Site</span>
                    <ExternalLink size={14} className="text-stone-500" />
                </a>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-400 transition-colors hover:bg-red-900/20 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50"
                >
                    <LogOut size={16} />
                    <span>{loggingOut ? "Logging out…" : "Logout"}</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-obsidian text-cream" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Toaster richColors position="top-right" theme="dark" />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — desktop (always visible) */}
            <aside className="fixed left-0 top-0 z-50 hidden h-screen w-60 flex-col border-r border-stone-800/70 bg-stone-950 lg:flex">
                <SidebarContent />
            </aside>

            {/* Sidebar — mobile (slide-in drawer) */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-stone-800/70 bg-stone-950 transition-transform duration-300 motion-reduce:transition-none lg:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="absolute right-3 top-4">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded p-1.5 text-stone-400 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                        aria-label="Close sidebar"
                    >
                        <X size={16} />
                    </button>
                </div>
                <SidebarContent />
            </aside>

            {/* Main area */}
            <div className="flex min-h-screen flex-col lg:pl-60">
                {/* Mobile topbar */}
                <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-stone-800 bg-stone-950 px-4 py-3 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded p-1.5 text-stone-400 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="text-sm font-semibold text-cream">Mod Studio</span>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const AdminLayout = () => (
    <UnsavedChangesProvider>
        <AdminShell />
    </UnsavedChangesProvider>
);

export default AdminLayout;
