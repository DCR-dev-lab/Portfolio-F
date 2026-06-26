import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AdminLogin from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import ManageProjects from "../pages/admin/projects/ManageProjects";
import ManageSkills from "../pages/admin/skills/ManageSkills";
import AdminProfile from "../pages/admin/AdminProfile";

import Home from "../pages/public/Home";
import Projects from "../pages/public/Projects";
import Skills from "../pages/public/Skills";
// import About from "../pages/public/About";
import Contact from "../pages/public/Contact";



const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
             <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/contact" element={<Contact />} />
           {/*  <Route path="/about" element={<About />} /> */}

            {/* Admin login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/projects" element={<ManageProjects />} />
                <Route path="/admin/skills" element={<ManageSkills />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
