import PortalLogin from "../../components/auth/PortalLogin";

const SchoolLogin = () => (
  <PortalLogin
    role="school"
    portalLabel="School portal"
    identifierLabel="School email or UDISE code"
    identifierType="text"
    identifierPlaceholder="Email or 11-digit UDISE code"
    register={{ prompt: "Don't have an account?", label: "Register your school", href: "/join/school" }}
  />
);

export default SchoolLogin;
