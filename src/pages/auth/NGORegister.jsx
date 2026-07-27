import { useNavigate } from "react-router-dom";
import { FaHandsHelping } from "react-icons/fa";
import AuthFormWrapper from "../../components/auth/AuthFormWrapper";
import RegisterForm from "../../components/auth/RegisterForm";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const focusAreas = [
  { value: "", label: "Select Focus Area" },
  { value: "education", label: "Education" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "digital", label: "Digital Literacy" },
  { value: "sanitation", label: "Sanitation & Health" },
  { value: "sports", label: "Sports & Culture" },
];

const NGORegister = () => {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    console.log("NGO register:", formData);
    navigate("/ngo/dashboard");
  };

  const extraFields = (
    <>
      <Input
        label="NGO Registration Number"
        id="regNumber"
        name="regNumber"
        placeholder="e.g. MH/2015/0012345"
      />
      <Input
        label="Website (Optional)"
        id="website"
        name="website"
        type="url"
        placeholder="https://yourngo.org"
      />
      <Select
        label="Primary Focus Area"
        id="focusArea"
        name="focusArea"
        options={focusAreas}
      />
    </>
  );

  return (
    <AuthFormWrapper
      title="Register Your NGO"
      subtitle="Partner with VIDYADAAN to transform government schools"
      icon={<FaHandsHelping />}
      iconBg="bg-slate-100"
      iconText="text-slate-600"
      switchText="Already registered?"
      switchLink="/ngo/login"
      switchLabel="Sign in here"
    >
      <RegisterForm
        onSubmit={handleSubmit}
        role="NGO"
        extraFields={extraFields}
      />
    </AuthFormWrapper>
  );
};

export default NGORegister;
