import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = () => {
  const adminToken = Cookies.get("adminToken");
    return adminToken ? <Outlet /> : <Navigate to="/admin/login" replace/>;
};

export default ProtectedRoute;