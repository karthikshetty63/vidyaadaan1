import React from "react";
import Container from "./Container";

const footerLinks = {
  "Quick Links": [
    { label: "Home", href: "#" },
    { label: "About Us", href: "#why" },
    { label: "Projects", href: "#projects" },
    { label: "Schools", href: "#projects" },
    { label: "Success Stories", href: "#stories" },
    { label: "Contact", href: "#contact" },
  ],
  "For Donors": [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Donate Now", href: "#projects" },
    { label: "Donation Policy", href: "#" },
    { label: "FAQs", href: "#faq" },
  ],
  "For Schools": [
    { label: "Register School", href: "#contact" },
    { label: "Submit a Need", href: "#contact" },
    { label: "Track Project", href: "#projects" },
    { label: "Resources", href: "#" },
  ],
  "For NGOs": [
    { label: "Partner With Us", href: "#contact" },
    { label: "NGO Login", href: "#contact" },
    { label: "Our Partners", href: "#" },
    { label: "Guidelines", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-[#070F1E] text-slate-400 text-xs">
      <div className="border-b border-slate-800/80">
        <Container className="py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative">

            {/* Column 1: Brand (2 cols wide on desktop) */}
            <div className="lg:col-span-2 flex flex-col gap-4 pr-4">
              <div className="flex items-center gap-2.5">
                {/* Logo Icon */}
                <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
                  <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                    <path d="M6 14C12 11 18 13 20 16C22 13 28 11 34 14V30C28 27 22 29 20 32C18 29 12 27 6 30V14Z" fill="#1E40AF" />
                    <path d="M8 12C13 9.5 18 11.5 20 14C22 11.5 27 9.5 32 12V27C27 24.5 22 26.5 20 29C18 26.5 13 24.5 8 27V12Z" fill="#0284C7" />
                    <path d="M10 10C14 8 18 10 20 12C22 10 26 8 30 10V24C26 22 22 24 20 26C18 24 14 22 10 24V10Z" fill="#10B981" />
                    <path d="M20 4L30 9L20 14L10 9L20 4Z" fill="#F59E0B" />
                  </svg>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-base text-white tracking-tight">VIDYADAAN</span>
                  <span className="text-[8px] text-emerald-400 font-bold tracking-wider">Empowering Education Across India</span>
                </div>
              </div>

              <p className="text-slate-400 leading-relaxed text-[11px] max-w-xs">
                Connecting hearts, supporting schools and building a stronger future for rural India.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2 pt-1">
                {["facebook", "instagram", "twitter", "youtube"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    aria-label={s}
                    className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <span className="capitalize text-[10px] font-bold">{s[0].toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Columns 2-5: Link groups */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="flex flex-col gap-3">
                <h4 className="text-white font-extrabold text-xs">{group}</h4>
                <ul className="flex flex-col gap-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-slate-400 hover:text-blue-400 text-[11px] transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Column 6: Contact Us + School Line Art */}
            <div className="flex flex-col gap-3 relative">
              <h4 className="text-white font-extrabold text-xs">Contact Us</h4>
              <ul className="flex flex-col gap-2.5 text-[11px]">
                <li className="flex items-center gap-2 text-slate-300">
                  <span>📞</span> +91 98765 43210
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span>✉️</span> support@vidyadaan.org
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span>📍</span> Bengaluru, Karnataka, India
                </li>
              </ul>

              {/* Doodle School Building Line Art */}
              <div className="mt-4 opacity-25 pointer-events-none text-right pr-2">
                <svg className="w-20 h-16 inline-block text-blue-300" fill="none" viewBox="0 0 100 80" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 70H90M20 70V35L50 15L80 35V70M35 70V50H65V70M50 15V5M45 5H55M30 40H40V50H30V40ZM60 40H70V50H60V40Z" />
                </svg>
              </div>
            </div>

          </div>
        </Container>
      </div>

      {/* Bottom Copyright Bar */}
      <Container>
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© 2024 VIDYADAAN. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
