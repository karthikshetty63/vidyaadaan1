import { Navigate, useLocation } from "react-router-dom";
import { readLastPortal } from "../../utils/lastPortal";

// /login: the sign-in page itself lets people choose School, NGO or Donor, so this opens the one last
// used on this device (School the first time), keeping where to go after signing in.
const RoleSelector = () => {
  const location = useLocation();
  return <Navigate to={`/login/${readLastPortal() || "school"}`} replace state={location.state} />;
};

export default RoleSelector;
