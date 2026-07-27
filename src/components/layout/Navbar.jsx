import React, { useState, useEffect } from "react";
import Container from "./Container";

const navLinks = [
  { label: "Home", href: "#", active: true },
  { label: "About Us", href: "#why" },
  { label: "Projects", href: "#projects" },
  { label: "Schools", href: "#projects" },
  { label: "NGOs", href: "#how-it-works" },
  { label: "Success Stories", href: "#stories" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
          scrolled ? "shadow-md" : "border-b border-slate-100"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo matching image */}
            <a href="#" onClick={(e) => scrollTo(e, "#")} className="flex items-center gap-3">
              {/* Colorful Wings / Open Book Logo Icon */}
              <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                  {/* Book Wings / Layers */}
                  <path d="M6 14C12 11 18 13 20 16C22 13 28 11 34 14V30C28 27 22 29 20 32C18 29 12 27 6 30V14Z" fill="#1E40AF" opacity="0.9" />
                  <path d="M8 12C13 9.5 18 11.5 20 14C22 11.5 27 9.5 32 12V27C27 24.5 22 26.5 20 29C18 26.5 13 24.5 8 27V12Z" fill="#0284C7" />
                  <path d="M10 10C14 8 18 10 20 12C22 10 26 8 30 10V24C26 22 22 24 20 26C18 24 14 22 10 24V10Z" fill="#10B981" />
                  {/* Graduation Cap top */}
                  <path d="M20 4L30 9L20 14L10 9L20 4Z" fill="#F59E0B" />
                  <path d="M28 10.5V16" stroke="#F59E0B" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="flex flex-col leading-tight">
                <span className="font-black text-lg tracking-tight text-[#0F172A]">
                  VIDYADAAN
                </span>
                <span className="text-[10px] text-emerald-600 font-bold tracking-tight">
                  Empowering Education Across India
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  className={`relative py-1 text-xs font-bold transition-colors duration-150 ${
                    link.active
                      ? "text-blue-600"
                      : "text-slate-700 hover:text-blue-600"
                  }`}
                >
                  {link.label}
                  {link.active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </a>
              ))}
            </nav>

            {/* Right Action Controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Search Icon */}
              <button
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </button>

              {/* Login Button */}
              <a
                href="#contact"
                onClick={(e) => scrollTo(e, "#contact")}
                className="px-5 py-2 text-xs font-bold text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
              >
                Login
              </a>

              {/* Join VIDYADAAN Button */}
              <a
                href="#projects"
                onClick={(e) => scrollTo(e, "#projects")}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-md shadow-blue-500/20"
              >
                Join VIDYADAAN
              </a>
            </div>

            {/* Mobile Drawer Hamburger */}
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
        </Container>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-2xl px-6 py-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3">
              <a href="#contact" onClick={(e) => scrollTo(e, "#contact")}
                className="flex-1 text-center py-2.5 text-xs font-bold text-blue-600 border-2 border-blue-600 rounded-full">
                Login
              </a>
              <a href="#projects" onClick={(e) => scrollTo(e, "#projects")}
                className="flex-1 text-center py-2.5 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md">
                Join VIDYADAAN
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
