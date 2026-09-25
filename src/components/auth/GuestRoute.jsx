import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DASHBOARD_ROLES = ["school", "ngo", "donor", "admin"];

/**
 * Sign-in and registration pages. Someone who is already signed in (for example with
 * "Remember me") goes straight to their dashboard instead of seeing the form again.
 */
const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user && DASHBOARD_ROLES.includes(user.role)) return <Navigate to={`/dashboard/${user.role}`} replace />;
  return <Outlet />;
};

export default GuestRoute;
