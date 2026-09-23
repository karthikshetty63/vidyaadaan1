import { Link } from "react-router-dom";
import { LuHandHeart, LuHeartHandshake, LuSchool } from "react-icons/lu";
import AccountChooser from "../../components/auth/AccountChooser";

const portals = [
  { key: "school", icon: LuSchool, title: "School", description: "Principals and staff managing school projects", href: "/login/school", continueLabel: "Continue to school sign in" },
  { key: "ngo", icon: LuHeartHandshake, title: "NGO partner", description: "Organisations verifying and supporting projects", href: "/login/ngo", continueLabel: "Continue to NGO sign in" },
  { key: "donor", icon: LuHandHeart, title: "Donor", description: "Individuals and companies funding school needs", href: "/login/donor", continueLabel: "Continue to donor sign in" },
];

const RoleSelector = () => (
  <AccountChooser
    title="Sign in to VIDYADAAN"
    description="Choose the type of account you use."
    legend="Account type"
    options={portals}
    rememberChoice
    headerLink={{ prompt: "New to VIDYADAAN?", label: "Create an account", href: "/join" }}
    footer={
      <>
        Platform administrator?{" "}
        <Link to="/login/admin" className="font-medium text-slate-700 hover:text-slate-900 hover:underline">Admin sign in</Link>
      </>
    }
  />
);

export default RoleSelector;
