import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import VidyadaanLogo from "../ui/VidyadaanLogo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#why" },
  { label: "Projects", href: "/#projects" },
  { label: "Schools", href: "/#projects" },
  { label: "NGOs", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e, link) => {
    if (link.isRoute) {
      setMobileOpen(false);
      return;
    }
    if (link.href.startsWith("/#")) {
      e.preventDefault();
      setMobileOpen(false);
      if (location.pathname !== "/") {
        window.location.href = link.href;
      } else {
        const id = link.href.replace("/#", "#");
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
            <nav className="hidden xl:flex items-center gap-5">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`relative py-1 text-xs font-bold transition-colors duration-150 ${
                      location.pathname === link.href
                        ? "text-blue-600 font-extrabold"
                        : "text-slate-700 hover:text-blue-600"
                    }`}
                  >
                    {link.label}
                    {location.pathname === link.href && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
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
                )
              )}
            </nav>

            {/* Right Action Controls */}
            <div className="hidden sm:flex items-center gap-3">
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
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  {link.label}
                </a>
              )
            )}

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
