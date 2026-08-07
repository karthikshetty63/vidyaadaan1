import React from "react";
import Container from "./Container";
import VidyadaanLogo from "../ui/VidyadaanLogo";

const footerLinks = {
  "Quick Links": [
    { label: "Home", href: "/" },
    { label: "My Impact Portal", href: "/impact" },
    { label: "About Us", href: "/#why" },
    { label: "Projects", href: "/#projects" },
    { label: "Contact Us", href: "/#contact" },
  ],
  "For Donors": [
    { label: "Browse Schools", href: "/login/donor" },
    { label: "Sponsor Event Packages", href: "/login/donor" },
    { label: "80G Tax Exemption", href: "/login/donor" },
    { label: "Corporate CSR Partnerships", href: "/#contact" },
    { label: "Donor Login", href: "/login/donor" },
  ],
  "For Schools": [
    { label: "School Registration", href: "/join/school" },
    { label: "Submit Infrastructure Need", href: "/login/school" },
    { label: "Request Event Support", href: "/login/school" },
    { label: "Upload Before/After Photos", href: "/login/school" },
    { label: "School Admin Login", href: "/login/school" },
  ],
  "For NGOs": [
    { label: "NGO Registration", href: "/join/ngo" },
    { label: "Review School Requests", href: "/login/ngo" },
    { label: "Verify Completed Projects", href: "/login/ngo" },
    { label: "Volunteer Management", href: "/login/ngo" },
    { label: "NGO Partner Login", href: "/login/ngo" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-[#070F1E] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <VidyadaanLogo variant="light" showTagline={true} />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              VIDYADAAN connects Government Schools, verified NGOs, and passionate Donors across India to build better classrooms, digital labs, and school event celebrations.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {["🌐", "📘", "🐦", "📸", "💼"].map((icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center text-xs transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VIDYADAAN. Empowering Government Schools Across India. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">80G Compliance</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
