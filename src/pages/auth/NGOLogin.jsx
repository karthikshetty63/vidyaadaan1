import { useNavigate } from "react-router-dom";
import { FaHandsHelping } from "react-icons/fa";
import AuthFormWrapper from "../../components/auth/AuthFormWrapper";
import LoginForm from "../../components/auth/LoginForm";

const NGOLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    console.log("NGO login:", formData);
    navigate("/ngo/dashboard");
  };

  return (
    <AuthFormWrapper
      title="NGO Login"
      subtitle="Sign in to your VIDYADAAN NGO account"
      icon={<FaHandsHelping />}
      iconBg="bg-slate-100"
      iconText="text-slate-600"
      switchText="New NGO partner?"
      switchLink="/ngo/register"
      switchLabel="Register your NGO"
    >
      <LoginForm
        onSubmit={handleSubmit}
        role="NGO"
        forgotLink="#"
      />
    </AuthFormWrapper>
  );
};

export default NGOLogin;
