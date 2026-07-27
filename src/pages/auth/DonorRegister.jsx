import { useNavigate } from "react-router-dom";
import { FaDonate } from "react-icons/fa";
import AuthFormWrapper from "../../components/auth/AuthFormWrapper";
import RegisterForm from "../../components/auth/RegisterForm";
import Input from "../../components/ui/Input";

const DonorRegister = () => {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    console.log("Donor register:", formData);
    navigate("/donor/dashboard");
  };

  const extraFields = (
    <>
      <Input
        label="Phone Number"
        id="phone"
        name="phone"
        type="tel"
        placeholder="+91 98765 43210"
      />
      <Input
        label="City"
        id="city"
        name="city"
        placeholder="e.g. Bengaluru"
      />
    </>
  );

  return (
    <AuthFormWrapper
      title="Create Donor Account"
      subtitle="Join VIDYADAAN and start making a difference"
      icon={<FaDonate />}
      iconBg="bg-emerald-50"
      iconText="text-emerald-600"
      switchText="Already have an account?"
      switchLink="/donor/login"
      switchLabel="Sign in here"
    >
      <RegisterForm
        onSubmit={handleSubmit}
        role="Donor"
        extraFields={extraFields}
      />
    </AuthFormWrapper>
  );
};

export default DonorRegister;
