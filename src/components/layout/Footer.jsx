import { Link } from "react-router-dom";
import { LuMail, LuMapPin, LuPhone } from "react-icons/lu";
import VidyadaanLogo from "../ui/VidyadaanLogo";
import { CONTACT } from "../../constants/contact";
import { LEGAL_LINKS } from "../../constants/legal";

// Only links that lead somewhere real.
const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Open school needs", to: "/needs" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Ways to take part", to: "/take-part" },
      { label: "Transparency", to: "/transparency" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Register your school", to: "/join/school" },
      { label: "Register your NGO", to: "/join/ngo" },
      { label: "Create a donor account", to: "/join/donor" },
      { label: "Sign in", to: "/login" },
    ],
  },
];

const linkClass = "text-sm text-slate-300 underline-offset-2 transition-colors hover:text-white hover:underline";
const CONTAINER = "mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10";

/**
 * The navy footer: the brand with the contact details, two link columns, then the policies. On pages that end
 * with the closing panel (FinalCta), the two read as one block.
 */
const Footer = () => (
  <footer className="on-dark bg-brand-navy text-slate-300">
    <div className={`${CONTAINER} grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-x-12`}>
      <div className="col-span-2 lg:col-span-1">
        <VidyadaanLogo variant="light" showTagline={false} />
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Connecting government schools in India with NGOs and donors, one need at a time.</p>
        <ul className="mt-5 space-y-2.5">
          <li className="flex items-center gap-2.5">
            <LuMail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <a href={`mailto:${CONTACT.email}`} className={`${linkClass} break-all`}>{CONTACT.email}</a>
          </li>
          <li className="flex items-center gap-2.5">
            <LuPhone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <a href={`tel:${CONTACT.phone}`} className={linkClass}>{CONTACT.phoneDisplay}</a>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-slate-300">
            <LuMapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            {CONTACT.location}
          </li>
        </ul>
      </div>

      {COLUMNS.map(({ title, links }) => (
        // On wide screens the headings line up with the middle of the logo.
        <nav key={title} aria-label={title} className="lg:pt-2.5">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <ul className="mt-4 space-y-2.5">
            {links.map(({ label, to }) => (
              <li key={label}><Link to={to} className={linkClass}>{label}</Link></li>
            ))}
          </ul>
        </nav>
      ))}
    </div>

    {/* The policies sit on the left, so the help button (fixed bottom right) never covers them; on phones the
        extra room at the bottom keeps them clear of the help button and the home page's "Get started" bar. */}
    <div className="border-t border-white/10">
      <div className={`${CONTAINER} flex flex-col gap-3 pb-20 pt-5 text-[13px] text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:pb-6 sm:pr-24`}>
        <p>
          © {new Date().getFullYear()} VIDYADAAN<span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">Made for government schools in India</span>
        </p>
        <nav aria-label="Policies">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {LEGAL_LINKS.map(({ label, to }) => (
              <li key={to}><Link to={to} className="underline-offset-2 transition-colors hover:text-white hover:underline">{label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
