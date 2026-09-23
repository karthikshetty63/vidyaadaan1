import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuCheck } from "react-icons/lu";
import Button from "../ui/Button";
import VidyadaanLogo from "../ui/VidyadaanLogo";

const LAST_PORTAL_KEY = "vidyadaan:last-portal";

const readLastPortal = () => {
  try {
    return localStorage.getItem(LAST_PORTAL_KEY) || "";
  } catch {
    return "";
  }
};

/**
 * "Which account?" screen used by /login and /join.
 * A focused panel with a single-choice list and one Continue button.
 * With `rememberChoice`, the last choice is remembered on this device and pre-selected next time.
 *
 * options: [{ key, icon, title, description, href, continueLabel }]
 */
const AccountChooser = ({ title, description, options, legend, headerLink, note, footer, rememberChoice = false }) => {
  const navigate = useNavigate();
  const [lastUsed] = useState(() => (rememberChoice && options.some((o) => o.key === readLastPortal()) ? readLastPortal() : ""));
  const [selected, setSelected] = useState(lastUsed);
  const choice = options.find((o) => o.key === selected);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!choice) return;
    if (rememberChoice) {
      try {
        localStorage.setItem(LAST_PORTAL_KEY, choice.key);
      } catch {
        /* storage unavailable — nothing to remember */
      }
    }
    navigate(choice.href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="h-16 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-8">
        <Link to="/" aria-label="VIDYADAAN home"><VidyadaanLogo variant="dark" showTagline={false} /></Link>
        {headerLink && (
          <p className="hidden sm:block text-sm text-slate-600">
            {headerLink.prompt}{" "}
            <Link to={headerLink.href} className="font-medium text-blue-700 hover:underline">{headerLink.label}</Link>
          </p>
        )}
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-panel shadow-xs px-5 py-7 sm:px-8 sm:py-8">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {description && <p className="mt-1.5 text-sm text-slate-600">{description}</p>}

            <form onSubmit={handleSubmit} className="mt-6">
              <fieldset>
                <legend className="sr-only">{legend}</legend>
                <div className="space-y-2">
                  {options.map(({ key, icon: Icon, title: optionTitle, description: optionDescription }) => {
                    const isSelected = selected === key;
                    return (
                      <label
                        key={key}
                        className={`relative flex items-center gap-3.5 rounded-control border px-4 py-3.5 cursor-pointer transition-colors ${
                          isSelected ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="account-type"
                          value={key}
                          checked={isSelected}
                          onChange={() => setSelected(key)}
                          className="peer sr-only"
                        />
                        <span
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                          aria-hidden="true"
                        >
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{optionTitle}</span>
                            {lastUsed === key && (
                              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">Last used</span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-sm text-slate-500">{optionDescription}</span>
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2 ${
                            isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <LuCheck className="w-3.5 h-3.5" strokeWidth={3} />}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <Button type="submit" size="lg" fullWidth className="mt-6" disabled={!choice}>
                {choice?.continueLabel || "Continue"}
              </Button>
            </form>

            {note && <p className="mt-4 text-xs text-slate-500 text-center">{note}</p>}
          </div>

          {headerLink && (
            <p className="sm:hidden mt-6 text-center text-sm text-slate-600">
              {headerLink.prompt}{" "}
              <Link to={headerLink.href} className="font-medium text-blue-700 hover:underline">{headerLink.label}</Link>
            </p>
          )}
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} VIDYADAAN</footer>
    </div>
  );
};

export default AccountChooser;
