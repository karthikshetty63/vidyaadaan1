import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Container from "./Container";

const footerLinks = {
  Platform: [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Projects", to: "/projects" },
    { label: "Contact", to: "/contact" },
  ],
  "Get Involved": [
    { label: "Join as School", to: "/school/register" },
    { label: "Join as Donor", to: "/donor/register" },
    { label: "Join as NGO", to: "/ngo/register" },
    { label: "Join VIDYADAAN", to: "/join" },
  ],
};

const socials = [
  { icon: FaFacebook, href: "#" },
  { icon: FaTwitter, href: "#" },
  { icon: FaInstagram, href: "#" },
  { icon: FaLinkedin, href: "#" },
];

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              VIDYADAAN
            </h2>
            <p className="text-sm leading-7 text-slate-400">
              A transparent donation platform connecting Government Schools, NGOs, and Donors to improve educational infrastructure.
            </p>
            <div className="flex gap-4 mt-6">
              {socials.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-blue-400 shrink-0" />
                support@vidyadaan.org
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-blue-400 shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-blue-400 shrink-0 mt-0.5" />
                Bengaluru, Karnataka, India
              </li>
            </ul>
          </div>

        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <Container className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} VIDYADAAN. All rights reserved.</p>
          <p>Built with ❤️ for Government Schools across India</p>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
