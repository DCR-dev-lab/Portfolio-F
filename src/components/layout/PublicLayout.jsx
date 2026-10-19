import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import ParticleStage from "../particles/ParticleStage";

/**
 * PublicLayout
 * Shared layout wrapper for all public-facing portfolio pages.
 * One fixed particle stage sits behind every page; <ParticleHeading> boxes inside the
 * sections tell it where to gather particles into titles.
 */
const PublicLayout = ({ children, withAmbient = true }) => {
    return (
        <div className="min-h-screen bg-[#0c0a09] text-[#faf8f5] flex flex-col relative selection:bg-red-600 selection:text-white">
            <ParticleStage />

            <Navbar />

            <main className="flex-1 relative z-10">
                {withAmbient && (
                    <>
                        <div className="absolute inset-0 bg-radial-top pointer-events-none" />
                        <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
                    </>
                )}
                {children || <Outlet />}
            </main>

            <Footer />
        </div>
    );
};

export default PublicLayout;
