import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/**
 * Reusable login form.
 * Props:
 *  - onSubmit: (formData) => void
 *  - forgotLink: string (path)
 *  - registerLink: string (path)
 *  - role: string (e.g. "School", "Donor", "NGO")
 */
const LoginForm = ({ onSubmit, forgotLink = "#", role = "" }) => {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
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

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Email Address"
        id="email"
        name="email"
        type="email"
        placeholder={`Enter your ${role} email`}
        value={form.email}
        onChange={handleChange}
        error={errors.email}
      />

      {/* Password with toggle */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-blue-300"}`}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
          >
            {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
            className="w-4 h-4 rounded accent-blue-600"
          />
          Remember me
        </label>
        <Link to={forgotLink} className="text-sm text-blue-600 hover:underline font-medium">
          Forgot Password?
        </Link>
      </div>

      <Button type="submit" fullWidth size="lg" className="mt-2">
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
