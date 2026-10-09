import PortalLogin from "../../components/auth/PortalLogin";

const DonorLogin = () => (
  <PortalLogin
    role="donor"
    portalLabel="Donor portal"
    register={{ prompt: "Don't have an account?", label: "Create a donor account", href: "/join/donor" }}
  />
);

export default DonorLogin;
