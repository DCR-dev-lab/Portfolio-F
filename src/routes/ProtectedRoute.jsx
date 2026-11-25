import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { isTokenStructurallyValid } from "../utils/security";

/**
 * ProtectedRoute — Enforces authentication for the /mod route hierarchy.
 * Preserves the user's attempted destination in location.state
 * so they can be smoothly returned to where they were headed post-login.
 */
const ProtectedRoute = () => {
    const location = useLocation();
    const adminToken = Cookies.get("adminToken");

    if (!isTokenStructurallyValid(adminToken)) {
        if (adminToken) {
            Cookies.remove("adminToken");
        }
        return <Navigate to="/mod/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
