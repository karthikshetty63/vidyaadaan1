import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { Input } from "./FormField";
import { PASSWORD_MIN_LENGTH } from "../../../shared/registrationRules.js";

/** How strong a new password looks: the only rule is the minimum length; the rest is advice. */
const strengthOf = (password) => {
  if (!password) return null;
  if (password.length < PASSWORD_MIN_LENGTH) return { score: 1, label: `Too short: use at least ${PASSWORD_MIN_LENGTH} characters`, tone: "bg-red-500", text: "text-red-700" };
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  const points = variety + (password.length >= 12 ? 1 : 0);
  if (points >= 4) return { score: 4, label: "Strong password", tone: "bg-emerald-500", text: "text-emerald-700" };
  if (points >= 3) return { score: 3, label: "Good password", tone: "bg-blue-500", text: "text-blue-700" };
  return { score: 2, label: "Fair: add capitals, numbers or symbols", tone: "bg-amber-500", text: "text-amber-700" };
};

/**
 * A password box with a show / hide button. With `showStrength`, a meter under it says how strong the
 * new password looks.
 */
const PasswordInput = ({ showStrength = false, className = "", ...props }) => {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? strengthOf(props.value) : null;
  return (
    <div>
      <div className="relative">
        <Input {...props} type={visible ? "text" : "password"} className={`pr-11 ${className}`} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label="Show password"
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <LuEyeOff className="h-4 w-4" aria-hidden="true" /> : <LuEye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {strength && (
        <div className="mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= strength.score ? strength.tone : "bg-slate-200"}`} />
            ))}
          </div>
          <p className={`mt-1 text-xs font-medium ${strength.text}`}>{strength.label}</p>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
