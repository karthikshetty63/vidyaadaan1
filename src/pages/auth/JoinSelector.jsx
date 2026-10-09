import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuArrowRight, LuCheck, LuFileText, LuHeart, LuSchool, LuUserPlus, LuUsers } from "react-icons/lu";
import AuthShell from "../../components/auth/AuthShell";
import { REGISTRATION_SCHEMAS } from "../../../shared/registrationRules.js";

// What each account is for and what to have ready (the documents the registration form asks for).
const ACCOUNT_TYPES = [
  {
    key: "school", icon: LuSchool, title: "School", description: "Register your school and ask for support",
    href: "/join/school", action: "Register a school", tint: "bg-blue-50 text-blue-600", selected: "border-blue-500 ring-blue-500",
    needs: ["School registration certificate", "Principal's ID proof", "School bank account number and IFSC"],
  },
  {
    key: "ngo", icon: LuUsers, title: "NGO partner", description: "Fund verified school needs and follow the work",
    href: "/join/ngo", action: "Register an NGO", tint: "bg-emerald-50 text-emerald-600", selected: "border-emerald-500 ring-emerald-500",
    needs: ["Registration certificate", "PAN card", "Registration number and date"],
  },
  {
    key: "donor", icon: LuHeart, title: "Donor", description: "Give to specific needs our team has approved",
    href: "/join/donor", action: "Create a donor account", tint: "bg-violet-50 text-violet-600", selected: "border-violet-500 ring-violet-500",
    needs: ["PAN card"],
  },
];

/** /join: choose the kind of account to create. The brand side follows the choice. */
const JoinSelector = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const legendId = useId();
  const choice = ACCOUNT_TYPES.find((t) => t.key === selected);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (choice) navigate(choice.href);
  };

  return (
    <AuthShell role={selected || undefined}>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/60" aria-hidden="true">
          <LuUserPlus className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-[1.75rem]">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Choose who you are to get started.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <fieldset>
          <legend id={legendId} className="text-sm font-semibold text-slate-800">I am a</legend>
          <div className="mt-2 space-y-3">
            {ACCOUNT_TYPES.map(({ key, icon: Icon, title, description, tint, selected: selectedStyle }) => {
              const isSelected = selected === key;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-600 ${
                    isSelected ? `ring-1 ${selectedStyle} shadow-md shadow-slate-900/5` : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                >
                  <input type="radio" name="account-type" value={key} checked={isSelected} onChange={() => setSelected(key)} className="sr-only" />
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-slate-900">{title}</span>
                    <span className="block text-sm text-slate-500">{description}</span>
                  </span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"}`}
                    aria-hidden="true"
                  >
                    <LuCheck className={`h-3.5 w-3.5 ${isSelected ? "opacity-100" : "opacity-0"}`} strokeWidth={3} />
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* What to have ready, for the chosen account. */}
        {choice && (
          <div key={choice.key} className="mt-5 rounded-2xl bg-slate-50 p-4 motion-safe:animate-view-enter">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <LuFileText className="h-3.5 w-3.5" aria-hidden="true" />
              Have these ready · {REGISTRATION_SCHEMAS[choice.key].steps.length} short steps
            </p>
            <ul className="mt-2 space-y-1.5">
              {choice.needs.map((need) => (
                <li key={need} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                  {need}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500">Documents can be PDF, JPG, PNG or WebP, up to 5 MB each.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!choice}
          className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
        >
          {choice ? choice.action : "Choose an account type"}
          {choice && <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-blue-700 hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
};

export default JoinSelector;
