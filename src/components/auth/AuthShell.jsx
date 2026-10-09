import { Link } from "react-router-dom";
import { LuCheck, LuGraduationCap, LuHandHeart, LuSchool, LuShieldCheck, LuUsers } from "react-icons/lu";
import VidyadaanLogo from "../ui/VidyadaanLogo";

// The three kinds of account, as the illustration shows them (admins are the VIDYADAAN team).
const TILES = [
  { key: "school", icon: LuSchool, label: "Schools", tile: "bg-sky-100 text-blue-600", ring: "ring-blue-300", spot: "left-0 top-2" },
  { key: "ngo", icon: LuUsers, label: "NGOs", tile: "bg-emerald-100 text-emerald-600", ring: "ring-emerald-300", spot: "right-2 top-1/3" },
  { key: "donor", icon: LuHandHeart, label: "Donors", tile: "bg-violet-100 text-violet-600", ring: "ring-violet-300", spot: "left-8 bottom-0" },
];

// What each kind of account does on VIDYADAAN: shown next to the sign-in form for the chosen account.
const ROLE_POINTS = {
  school: { title: "For schools", points: ["Post your school's infrastructure needs", "Follow every review and every rupee raised", "Accept NGO payments once they reach you"] },
  ngo: { title: "For NGOs", points: ["Browse needs our team has checked", "Fund one or more of 5 equal parts", "Pay online, or directly with proof"] },
  donor: { title: "For donors", points: ["Give to one specific, approved need", "Pay securely through Razorpay", "Download a report of your donations"] },
  admin: { title: "For the VIDYADAAN team", points: ["Approve schools, NGOs and donors", "Review every project before it's listed", "Check schools' UPI payment QRs"] },
};
const DEFAULT_POINTS = { title: "How VIDYADAAN works", points: ["A person checks every account", "Every project is reviewed before it's listed", "Only confirmed money counts as raised"] };

/** The orbit of account types, with the chosen one brought forward. */
const Orbit = ({ role }) => (
  <div className="relative h-52 w-52 shrink-0" aria-hidden="true">
    <svg viewBox="0 0 224 224" className="absolute inset-0 h-full w-full text-blue-200">
      <circle cx="112" cy="112" r="84" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7" />
      <circle cx="196" cy="70" r="5" className="fill-blue-400" />
      <circle cx="150" cy="200" r="6" className="fill-blue-600" />
    </svg>
    <div className="absolute inset-10 rounded-full bg-white/60 blur-2xl" />
    {TILES.map(({ key, icon: Icon, tile, ring, spot }, i) => {
      const active = role === key;
      return (
        <span
          key={key}
          style={{ animationDelay: `${i * -1.3}s` }}
          className={`absolute ${spot} flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-slate-900/5 transition duration-500 motion-safe:animate-bob ${tile} ${
            active ? `scale-110 ring-4 ring-offset-4 ring-offset-transparent ${ring}` : role ? "scale-90 opacity-70" : ""
          }`}
        >
          <Icon className="h-7 w-7" />
        </span>
      );
    })}
  </div>
);

/** A hand-drawn underline. */
export const Swoosh = ({ className }) => (
  <svg viewBox="0 0 220 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 18C60 6 140 2 216 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const Leaves = ({ className }) => (
  <svg viewBox="0 0 80 100" className={className} aria-hidden="true">
    <path d="M40 98C38 70 40 45 52 20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M52 20C62 30 62 46 50 56C40 46 42 30 52 20Z" fill="currentColor" opacity="0.55" />
    <path d="M44 52C30 46 14 50 8 62C22 70 38 66 44 52Z" fill="currentColor" opacity="0.4" />
    <path d="M42 74C54 66 70 68 76 80C64 88 48 86 42 74Z" fill="currentColor" opacity="0.3" />
  </svg>
);

/** The brand side: who VIDYADAAN is for, and what the chosen account can do. */
const BrandPanel = ({ role }) => {
  const { title, points } = ROLE_POINTS[role] || DEFAULT_POINTS;
  return (
    <section className="relative hidden flex-col justify-between overflow-hidden px-10 py-10 lg:flex xl:px-16" aria-label="About VIDYADAAN">
      <Link to="/" className="relative w-fit rounded-control" aria-label="VIDYADAAN home">
        <VidyadaanLogo />
      </Link>

      <div className="relative my-10 max-w-xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-1.5 text-sm font-semibold text-blue-700">
          <LuGraduationCap className="h-4 w-4" aria-hidden="true" />
          Education creates opportunities
        </p>
        <p className="mt-6 font-heading text-5xl font-extrabold leading-[1.08] tracking-tight text-brand-navy xl:text-[3.5rem] 2xl:text-6xl">
          Stronger Schools.
          <span className="block bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">Brighter Futures.</span>
        </p>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
          Bridging the gap between schools, NGOs, donors and alumni to create real change in education.
        </p>

        <div className="mt-8 flex items-center gap-8">
          {/* Changes with the account chosen on the form. */}
          <div key={role || "all"} className="w-full max-w-sm rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm shadow-blue-900/5 backdrop-blur motion-safe:animate-view-enter">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{title}</p>
            <ul className="mt-3 space-y-2.5">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <LuCheck className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          {/* Only where there is room beside the box. */}
          <div className="hidden min-[1380px]:block">
            <Orbit role={role} />
          </div>
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-6">
        <div className="pl-10">
          <p className="handwritten -rotate-6 text-3xl font-semibold leading-tight text-blue-700">
            Small steps
            <br />
            create big changes
          </p>
          <Swoosh className="-mt-1 w-52 -rotate-6 text-blue-500" />
        </div>
        <p className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 2xl:block">
          Better education <span className="mx-2 text-slate-300">/</span> Stronger communities <span className="mx-2 text-slate-300">/</span> A brighter tomorrow
        </p>
      </div>
      <Leaves className="pointer-events-none absolute -bottom-2 left-2 h-28 w-24 text-blue-400" />
    </section>
  );
};

/** The soft background shapes and the handwritten corner note, shared by every account page. */
export const AuthBackdrop = () => (
  <>
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/70" />
      <div className="absolute -bottom-48 left-1/4 h-96 w-[60rem] rounded-[100%] bg-blue-100/50" />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />
    </div>
    <p className="handwritten pointer-events-none absolute right-10 top-8 hidden rotate-[-8deg] text-right text-2xl font-semibold leading-6 text-blue-700/80 xl:block" aria-hidden="true">
      Learn
      <br />
      &nbsp;&nbsp;Support
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;Build
    </p>
  </>
);

/**
 * The sign-in pages' frame: the brand side (large screens) and a white card with the form. `role`
 * (school, ngo, donor or admin) picks what the brand side says; leave it out for pages that serve
 * every account, such as password reset.
 */
const AuthShell = ({ role, children }) => (
  <div className="relative min-h-dvh overflow-clip bg-[#f4f8ff] text-slate-900">
    <AuthBackdrop />

    <div className="relative mx-auto grid min-h-dvh max-w-[90rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <BrandPanel role={role} />

      <main className="flex flex-col items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
        <Link to="/" className="mb-6 w-fit rounded-control lg:hidden" aria-label="VIDYADAAN home">
          <VidyadaanLogo />
        </Link>
        <div className="w-full max-w-[30rem] rounded-[1.75rem] border border-white bg-white/95 p-6 shadow-[0_24px_60px_-24px_rgb(30_64_175/0.25)] sm:p-10">
          {children}
        </div>
        <p className="mt-6 flex items-center gap-1.5 text-center text-xs text-slate-500">
          <LuShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
          Every account is checked by the VIDYADAAN team before it can sign in.
        </p>
      </main>
    </div>
  </div>
);

export default AuthShell;
