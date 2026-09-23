import PortalLogin from "../../components/auth/PortalLogin";

// Admin accounts are created with `npm run create-admin` — there is no public admin sign-up.
const AdminLogin = () => (
  <PortalLogin
    role="admin"
    image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=900&auto=format&fit=crop"
    quote="Verification keeps every rupee reaching the right classroom."
    portalLabel="Admin console"
    description="Review and approve school and NGO registrations."
    identifierLabel="Admin email"
    identifierPlaceholder="admin@vidyadaan.org"
    showGoogleDemo={false}
    footerNote={<p className="text-slate-500">Admin accounts are created by the platform team. There is no public admin registration.</p>}
  />
);

export default AdminLogin;
