import PortalLogin from "../../components/auth/PortalLogin";

const SchoolLogin = () => (
  <PortalLogin
    role="school"
    image="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=900&auto=format&fit=crop"
    quote="Every transparent update inspires another donor."
    portalLabel="School portal"
    description="Manage your school's development projects and updates."
    identifierLabel="School email or UDISE code"
    identifierType="text"
    identifierPlaceholder="school@example.gov.in or 11-digit UDISE code"
    register={{ prompt: "School not registered yet?", label: "Register your school", href: "/join/school" }}
  />
);

export default SchoolLogin;
