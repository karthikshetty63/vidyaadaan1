import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ role }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;
    if (!user) return <Navigate to={`/login/${role}`} replace state={{ from: location }} />;
    if (user.role !== role) {
        const fallback = ["school", "ngo", "donor"].includes(user.role) ? `/dashboard/${user.role}` : "/login";
        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
