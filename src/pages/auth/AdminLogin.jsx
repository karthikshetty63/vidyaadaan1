import PortalLogin from "../../components/auth/PortalLogin";

// Admin accounts are created with `npm run create-admin` — there is no public admin sign-up.
const AdminLogin = () => (
  <PortalLogin
    role="admin"
    portalLabel="Admin console"
    identifierLabel="Admin email"
    identifierPlaceholder="admin@vidyadaan.org"
    showGoogle={false}
    footerNote={<p className="text-xs text-slate-500">Admin accounts are created by the platform team. There is no public admin registration.</p>}
  />
);

export default AdminLogin;
