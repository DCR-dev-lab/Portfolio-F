import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * ProtectedRoute — Enforces authentication for the /mod route hierarchy.
 * Preserves the user's attempted destination in location.state
 * so they can be smoothly returned to where they were headed post-login.
 */
const ProtectedRoute = () => {
    const location = useLocation();
    const adminToken = Cookies.get("adminToken");

    return adminToken ? (
        <Outlet />
    ) : (
        <Navigate to="/mod/login" state={{ from: location }} replace />
    );
};

export default ProtectedRoute;
