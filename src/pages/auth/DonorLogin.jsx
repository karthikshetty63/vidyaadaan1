import PortalLogin from "../../components/auth/PortalLogin";

const DonorLogin = () => (
  <PortalLogin
    role="donor"
    image="https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=900&auto=format&fit=crop"
    quote="Your generosity creates brighter classrooms for every child."
    portalLabel="Donor portal"
    description="See the impact of your donations and discover school needs."
    register={{ prompt: "New to VIDYADAAN?", label: "Create a donor account", href: "/join/donor" }}
  />
);

export default DonorLogin;
