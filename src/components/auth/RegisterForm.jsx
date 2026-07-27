import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/**
 * Reusable register form.
 * Props:
 *  - onSubmit: (formData) => void
 *  - role: string
 *  - extraFields: JSX (optional role-specific fields rendered between name and email)
 */
const RegisterForm = ({ onSubmit, role = "", extraFields }) => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", agree: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.agree) e.agree = "You must accept the terms";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit?.(form);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /* Password field with visibility toggle */
  const PasswordField = ({ id, label, name, value, show, onToggle, error }) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={label}
          value={value}
          onChange={handleChange}
          className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-blue-300"}`}
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
          {show ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label={`${role} Name`}
        id="name"
        name="name"
        placeholder={`Enter ${role.toLowerCase()} name`}
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />

      {/* Role-specific extra fields (e.g. school UDISE code, NGO reg number) */}
      {extraFields}

      <Input
        label="Email Address"
        id="email"
        name="email"
        type="email"
        placeholder="Enter email address"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
      />

      <PasswordField
        id="password"
        label="Password"
        name="password"
        value={form.password}
        show={showPass}
        onToggle={() => setShowPass(!showPass)}
        error={errors.password}
      />

      <PasswordField
        id="confirmPassword"
        label="Confirm Password"
        name="confirmPassword"
        value={form.confirmPassword}
        show={showConfirm}
        onToggle={() => setShowConfirm(!showConfirm)}
        error={errors.confirmPassword}
      />

      {/* Terms */}
      <div>
        <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            className="w-4 h-4 mt-0.5 rounded accent-blue-600 shrink-0"
          />
          I agree to the{" "}
          <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span>
          {" "}and{" "}
          <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>
        </label>
        {errors.agree && <p className="text-xs text-red-500 mt-1">{errors.agree}</p>}
      </div>

      <Button type="submit" fullWidth size="lg" className="mt-2">
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;
