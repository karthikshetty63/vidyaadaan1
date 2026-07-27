import { useNavigate } from "react-router-dom";
import { FaSchool } from "react-icons/fa";
import AuthFormWrapper from "../../components/auth/AuthFormWrapper";
import RegisterForm from "../../components/auth/RegisterForm";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const schoolTypes = [
  { value: "", label: "Select School Type" },
  { value: "primary", label: "Primary School" },
  { value: "high", label: "High School" },
  { value: "composite", label: "Composite School" },
  { value: "model", label: "Model School" },
];

const SchoolRegister = () => {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    console.log("School register:", formData);
    navigate("/school/dashboard");
  };

  /* Extra school-specific fields injected into RegisterForm */
  const extraFields = (
    <>
      <Input
        label="UDISE Code"
        id="udise"
        name="udise"
        placeholder="Enter 11-digit UDISE code"
        maxLength={11}
      />
      <Input
        label="District"
        id="district"
        name="district"
        placeholder="e.g. Dakshina Kannada"
      />
      <Select
        label="School Type"
        id="schoolType"
        name="schoolType"
        options={schoolTypes}
      />
    </>
  );

  return (
    <AuthFormWrapper
      title="Register Your School"
      subtitle="Create a VIDYADAAN account for your government school"
      icon={<FaSchool />}
      iconBg="bg-blue-50"
      iconText="text-blue-600"
      switchText="Already registered?"
      switchLink="/school/login"
      switchLabel="Sign in here"
    >
      <RegisterForm
        onSubmit={handleSubmit}
        role="School"
        extraFields={extraFields}
      />
    </AuthFormWrapper>
  );
};

export default SchoolRegister;
