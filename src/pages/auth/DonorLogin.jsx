import { useNavigate } from "react-router-dom";
import { FaDonate } from "react-icons/fa";
import AuthFormWrapper from "../../components/auth/AuthFormWrapper";
import LoginForm from "../../components/auth/LoginForm";

const DonorLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    console.log("Donor login:", formData);
    navigate("/donor/dashboard");
  };

  return (
    <AuthFormWrapper
      title="Donor Login"
      subtitle="Sign in to your VIDYADAAN donor account"
      icon={<FaDonate />}
      iconBg="bg-emerald-50"
      iconText="text-emerald-600"
      switchText="New to VIDYADAAN?"
      switchLink="/donor/register"
      switchLabel="Create a donor account"
    >
      <LoginForm
        onSubmit={handleSubmit}
        role="Donor"
        forgotLink="#"
      />
    </AuthFormWrapper>
  );
};

export default DonorLogin;
