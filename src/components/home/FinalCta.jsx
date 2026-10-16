import { Link } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { Reveal } from "./motion";
import { PATHS } from "./paths";

/** The last nudge: the chosen path's own start, or sign up. Signed-in people go to their dashboard. */
const FinalCta = ({ path }) => {
  const { user } = useAuth();
  const own = PATHS[path];
  const primary = user ? { label: "Go to your dashboard", to: `/dashboard/${user.role}` } : own && !own.primary.to.startsWith("/#") ? own.primary : { label: "Get started", to: "/join" };
  return (
    <section aria-labelledby="cta-heading" className="px-5 sm:px-8 lg:px-10">
      <Reveal from="zoom" className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 bg-[length:200%_200%] px-6 py-12 text-center text-white motion-safe:animate-pan sm:px-12 sm:py-16">
        <span className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/15" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-white/5" aria-hidden="true" />
        <p className="handwritten relative text-3xl font-semibold text-blue-100">Small steps create big changes</p>
        {/* A hand-drawn underline that draws itself when the band comes into view. */}
        <svg viewBox="0 0 260 14" fill="none" className="draw-line relative mx-auto -mt-1 h-3 w-60 text-sky-300" aria-hidden="true">
          <path d="M4 10C70 3 170 1 256 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <h2 id="cta-heading" className="relative mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Help a government school today</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-blue-100">Join the schools, NGOs and donors making real needs visible, verified and funded.</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link to={primary.to} className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl motion-reduce:hover:translate-y-0">
            {primary.label} <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
          </Link>
          <a href="#needs" className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 text-[15px] font-semibold text-white transition hover:bg-white/10">
            See open needs
          </a>
        </div>
      </Reveal>
    </section>
  );
};

export default FinalCta;
