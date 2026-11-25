import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicLayout from "../components/layout/PublicLayout";

// Public pages
import Home from "../pages/public/Home";
import Projects from "../pages/public/Projects";
import Contact from "../pages/public/Contact";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";
import TermsOfService from "../pages/public/TermsOfService";
import NotFound from "../pages/public/NotFound";

// Professional Route-level Code Splitting (Zero bytes of mod code loaded for public visitors)
const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));
const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ManageProjects = lazy(() => import("../pages/admin/projects/ManageProjects"));
const AddProject = lazy(() => import("../pages/admin/projects/AddProject"));
const EditProject = lazy(() => import("../pages/admin/projects/EditProject"));
const ManageSkills = lazy(() => import("../pages/admin/skills/ManageSkills"));
const AddSkill = lazy(() => import("../pages/admin/skills/AddSkill"));
const EditSkill = lazy(() => import("../pages/admin/skills/EditSkill"));
const AdminProfile = lazy(() => import("../pages/admin/AdminProfile"));
const AuditLog = lazy(() => import("../pages/admin/AuditLog"));

// Sleek fallback while mod chunks are downloaded
const ModFallback = () => (
    <div className="flex min-h-screen items-center justify-center bg-obsidian text-stone-500">
        <div className="flex items-center gap-3">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-crimson border-t-transparent" />
            <span className="font-mono text-xs text-stone-400">Loading Mod Studio…</span>
        </div>
    </div>
);

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes wrapped in PublicLayout */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="*" element={<NotFound />} />
            </Route>

            {/* Moderation Login — standalone, no sidebar */}
            <Route
                path="/mod/login"
                element={
                    <Suspense fallback={<ModFallback />}>
                        <AdminLogin />
                    </Suspense>
                }
            />

            {/* Protected Mod routes — isolated with deep linking and code splitting */}
            <Route element={<ProtectedRoute />}>
                <Route
                    element={
                        <Suspense fallback={<ModFallback />}>
                            <AdminLayout />
                        </Suspense>
                    }
                >
                    <Route path="/mod" element={<Navigate to="/mod/dashboard" replace />} />
                    <Route path="/mod/dashboard" element={<Dashboard />} />

                    {/* Deep-linkable Projects routing */}
                    <Route path="/mod/projects" element={<ManageProjects />} />
                    <Route path="/mod/projects/new" element={<AddProject />} />
                    <Route path="/mod/projects/:id" element={<EditProject />} />

                    {/* Deep-linkable Skills routing */}
                    <Route path="/mod/skills" element={<ManageSkills />} />
                    <Route path="/mod/skills/new" element={<AddSkill />} />
                    <Route path="/mod/skills/:id" element={<EditSkill />} />

                    {/* Profile & Audit Log */}
                    <Route path="/mod/profile" element={<AdminProfile />} />
                    <Route path="/mod/audit-log" element={<AuditLog />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
