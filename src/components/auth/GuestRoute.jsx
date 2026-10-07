import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { returnPathAfterLogin } from "../../utils/loginReturn";

const DASHBOARD_ROLES = ["school", "ngo", "donor", "admin"];

/**
 * Sign-in and registration pages. Someone who is already signed in (for example with
 * "Remember me") goes straight to their dashboard instead of seeing the form again.
 * This also runs right after signing in, so it sends them where the login form does
 * (e.g. back to the project page they came from), instead of racing it to the dashboard.
 */
const GuestRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (user && DASHBOARD_ROLES.includes(user.role)) return <Navigate to={returnPathAfterLogin(location.state?.from?.pathname, user.role)} replace />;
  return <Outlet />;
};

export default GuestRoute;
