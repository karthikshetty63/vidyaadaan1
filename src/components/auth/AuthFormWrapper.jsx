import { Link } from "react-router-dom";
import GoogleButton from "./GoogleButton";

/**
 * Shared wrapper for all auth forms (Login & Register).
 * Props:
 *  - title: string
 *  - subtitle: string
 *  - icon: JSX element
 *  - iconBg: tailwind bg class
 *  - iconText: tailwind text class
 *  - children: form fields
 *  - switchText: string
 *  - switchLink: string (path)
 *  - switchLabel: string (link text)
 */
const AuthFormWrapper = ({
  title,
  subtitle,
  icon,
  iconBg = "bg-blue-50",
  iconText = "text-blue-600",
  children,
  switchText,
  switchLink,
  switchLabel,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <span className={`text-3xl ${iconText}`}>{icon}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>

          {/* Google Button */}
          <GoogleButton />

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-slate-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form Fields */}
          {children}

          {/* Switch Link */}
          {switchText && (
            <p className="text-center text-sm text-slate-500 mt-6">
              {switchText}{" "}
              <Link to={switchLink} className="text-blue-600 font-semibold hover:underline">
                {switchLabel}
              </Link>
            </p>
          )}

        </div>

        {/* Back to Join */}
        <p className="text-center text-sm text-slate-400 mt-5">
          <Link to="/join" className="hover:text-blue-600 transition-colors">
            ← Back to Join Page
          </Link>
        </p>

      </div>
    </div>
  );
};

export default AuthFormWrapper;
