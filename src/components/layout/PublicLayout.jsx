import { useEffect } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import ParticleStage from "../particles/ParticleStage";
import CursorFX from "../common/CursorFX";

/**
 * PublicLayout
 * Shared layout wrapper for all public-facing portfolio pages.
 * Handles fullscreen 3D mode on /projects: completely unmounts Navbar and Footer
 * unless the user switches to the classic "grid" mode.
 */
const PublicLayout = ({ children, withAmbient = true }) => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isHome = location.pathname === "/";
    const isContact = location.pathname === "/contact";
    const isProjects = location.pathname === "/projects";
    const projectsView = searchParams.get("view") || "tunnel";
    const hasProject = Boolean(searchParams.get("project"));
    const isProjectsFullscreen = isProjects && (projectsView !== "grid" || hasProject);

    // Initialize Studio-Grade Inertial Smooth Scroll (Lenis)
    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;

        const lenis = new Lenis({
            autoRaf: true,
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            syncTouch: false,
        });

        window.__lenis = lenis;

        return () => {
            lenis.destroy();
            window.__lenis = null;
        };
    }, []);

    // Instant scroll to top on route change
    useEffect(() => {
        if (window.__lenis) {
            window.__lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-obsidian text-cream flex flex-col relative selection:bg-red-600 selection:text-white">
            <ParticleStage />

            {/* Navbar is only rendered when NOT in fullscreen 3D mode */}
            {!isProjectsFullscreen && <Navbar />}

            <main className="flex-1 relative z-10">
                {withAmbient && !isProjectsFullscreen && (
                    <>
                        <div className="absolute inset-0 bg-radial-top pointer-events-none" />
                        <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
                    </>
                )}
                {children || <Outlet />}
            </main>

            {/* Footer is hidden on Home, Contact (each carries its own whisper baseline), and fullscreen 3D mode */}
            {!isHome && !isContact && !isProjectsFullscreen && <Footer />}

            <CursorFX />
        </div>
    );
};

export default PublicLayout;
