import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LuMenu, LuX } from "react-icons/lu";
import VidyadaanLogo from "../ui/VidyadaanLogo";
import { useAuth } from "../../context/AuthContext";

const PRIMARY = "inline-flex h-10 items-center justify-center rounded-md bg-brand-navy px-4 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-slate-800";
const QUIET = "inline-flex h-10 items-center justify-center rounded-md px-3 text-[0.9375rem] font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900";

// The public pages. The current one is highlighted (NavLink also marks it aria-current="page").
const NAV_LINKS = [
  { label: "School needs", to: "/needs" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Take part", to: "/take-part" },
  { label: "Transparency", to: "/transparency" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];
const navLinkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-md px-2 py-2 text-[0.9375rem] transition-colors xl:px-3 ${
    isActive ? "bg-slate-100 font-semibold text-brand-navy" : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
const menuLinkClass = ({ isActive }) =>
  `block rounded-md px-3 py-3 text-lg text-slate-800 hover:bg-slate-100 ${isActive ? "bg-slate-100 font-semibold" : "font-medium"}`;

const Navbar = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  // Signed in (e.g. with "Remember me"): offer the dashboard instead of Sign in / Get started.
  const dashboardHref = user ? `/dashboard/${user.role}` : null;
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const accountActions = (className = "") =>
    dashboardHref ? (
      <Link to={dashboardHref} onClick={closeMenu} className={`${PRIMARY} ${className}`}>Go to dashboard</Link>
    ) : (
      <>
        <Link to="/login" onClick={closeMenu} className={`${QUIET} ${className}`}>Sign in</Link>
        <Link to="/join" onClick={closeMenu} className={`${PRIMARY} ${className}`}>Get started</Link>
      </>
    );

  return (
    <>
      {/* Dims the page behind the open phone menu; tapping it closes the menu. */}
      {menuOpen && <div className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden" onClick={closeMenu} aria-hidden="true" />}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 sm:px-8 lg:px-10">
          <Link to="/" onClick={closeMenu} aria-label="VIDYADAAN home" className="shrink-0 rounded-md">
            <VidyadaanLogo showTagline={false} />
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden sm:flex items-center gap-2">{accountActions()}</div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="ml-auto sm:ml-0 lg:hidden -mr-2 p-2 rounded-md text-slate-800 hover:bg-slate-100"
          >
            {menuOpen ? <LuX className="w-5 h-5" aria-hidden="true" /> : <LuMenu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="lg:hidden border-t border-slate-200 bg-white">
            <nav aria-label="Main" className="mx-auto max-w-[1200px] px-5 py-3 sm:px-8">
              <ul className="space-y-1">
                {NAV_LINKS.map(({ label, to }) => (
                  <li key={to}>
                    <NavLink to={to} onClick={closeMenu} className={menuLinkClass}>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 pb-2 sm:hidden">{accountActions("w-full")}</div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
