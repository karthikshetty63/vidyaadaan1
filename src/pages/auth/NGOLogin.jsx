import PortalLogin from "../../components/auth/PortalLogin";

const NGOLogin = () => (
  <PortalLogin
    role="ngo"
    portalLabel="NGO partner portal"
    identifierPlaceholder="ngo@organisation.org"
    register={{ prompt: "Don't have an account?", label: "Register your NGO", href: "/join/ngo" }}
  />
);

export default NGOLogin;
