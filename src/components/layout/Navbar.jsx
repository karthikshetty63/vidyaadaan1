import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import VidyadaanLogo from "../ui/VidyadaanLogo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#why" },
  { label: "Projects", href: "/#projects" },
  { label: "Schools", href: "/#projects" },
  { label: "NGOs", href: "/#how-it-works" },
  { label: "Success Stories", href: "/#stories" },
  { label: "Contact", href: "/#contact" },
];

const dashboardLinks = [
  { label: "🏫 School Dashboard", href: "/dashboard/school", sub: "For Govt. Schools" },
  { label: "🤝 NGO Dashboard", href: "/dashboard/ngo", sub: "For NGO Partners" },
  { label: "💙 Donor Dashboard", href: "/dashboard/donor", sub: "For Donors" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashMenuOpen, setDashMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e, href) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      setMobileOpen(false);
      if (location.pathname !== "/") {
        window.location.href = href;
      } else {
        const id = href.replace("/#", "#");
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setMobileOpen(false);
    }
  };

  const isHome = location.pathname === "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
          scrolled ? "shadow-md py-1" : "border-b border-slate-100 py-2"
        }`}
      >
        <div className="w-full mx-auto px-6 sm:px-10 lg:px-12 max-w-[1400px]">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link to="/">
              <VidyadaanLogo variant="dark" showTagline={true} />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-1 text-xs font-bold transition-colors duration-150 ${
                    isHome && link.href === "/"
                      ? "text-blue-600"
                      : "text-slate-700 hover:text-blue-600"
                  }`}
                >
                  {link.label}
                  {isHome && link.href === "/" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </a>
              ))}
            </nav>

            {/* Right Action Controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Dashboards Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDashMenuOpen(!dashMenuOpen)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <span>📊 Dashboards</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${dashMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dashMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDashMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Portal</p>
                      </div>
                      {dashboardLinks.map((d) => (
                        <Link
                          key={d.href}
                          to={d.href}
                          onClick={() => setDashMenuOpen(false)}
                          className="px-4 py-2.5 hover:bg-blue-50 transition-colors flex flex-col group"
                        >
                          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">{d.label}</span>
                          <span className="text-[10px] text-slate-400">{d.sub}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Link
                to="/login"
                className="px-5 py-2 text-xs font-bold text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/join"
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-md shadow-blue-500/20"
              >
                Join VIDYADAAN
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="xl:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-2xl px-6 py-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 mt-2 border-t border-slate-100">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Dashboards</p>
              {dashboardLinks.map((d) => (
                <Link
                  key={d.href}
                  to={d.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center justify-between"
                >
                  <span>{d.label}</span>
                  <span className="text-[10px] text-slate-400">→</span>
                </Link>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3">
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-xs font-bold text-blue-600 border-2 border-blue-600 rounded-full">
                Login
              </Link>
              <Link to="/join" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md">
                Join VIDYADAAN
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
