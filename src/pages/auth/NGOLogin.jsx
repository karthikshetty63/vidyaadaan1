import PortalLogin from "../../components/auth/PortalLogin";

const NGOLogin = () => (
  <PortalLogin
    role="ngo"
    image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=900&auto=format&fit=crop"
    quote="Together we create opportunities that transform young lives."
    portalLabel="NGO partner portal"
    description="Review school needs, manage volunteers and verify project progress."
    identifierPlaceholder="ngo@organisation.org"
    register={{ prompt: "NGO not registered yet?", label: "Register your NGO", href: "/join/ngo" }}
  />
);

export default NGOLogin;
