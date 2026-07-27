import { useNavigate } from "react-router-dom";
import { FaSchool } from "react-icons/fa";
import AuthFormWrapper from "../../components/auth/AuthFormWrapper";
import LoginForm from "../../components/auth/LoginForm";

const SchoolLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    /* Dummy auth — navigate to school dashboard */
    console.log("School login:", formData);
    navigate("/school/dashboard");
  };

  return (
    <AuthFormWrapper
      title="School Login"
      subtitle="Sign in to your school's VIDYADAAN account"
      icon={<FaSchool />}
      iconBg="bg-blue-50"
      iconText="text-blue-600"
      switchText="Don't have an account?"
      switchLink="/school/register"
      switchLabel="Register your school"
    >
      <LoginForm
        onSubmit={handleSubmit}
        role="School"
        forgotLink="#"
      />
    </AuthFormWrapper>
  );
};

export default SchoolLogin;
