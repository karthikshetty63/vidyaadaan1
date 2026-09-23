import { Link } from "react-router-dom";
import Alert from "../ui/Alert";

const PORTAL_LABELS = { school: "School", ngo: "NGO", donor: "Donor", admin: "Admin" };

// Login error, plus a link when the user picked the wrong portal.
const LoginErrorAlert = ({ error, correctPortal }) => {
  if (!error) return null;
  return (
    <Alert tone="danger" className="mb-5">
      {error}
      {correctPortal && (
        <Link to={`/login/${correctPortal}`} className="block mt-1 font-semibold underline underline-offset-2">
          Go to {PORTAL_LABELS[correctPortal]} login →
        </Link>
      )}
    </Alert>
  );
};

export default LoginErrorAlert;
