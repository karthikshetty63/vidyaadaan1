import { Link } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { PATHS } from "./paths";
import { CONTAINER } from "./styles";

/**
 * The last nudge, as a panel at the top of the navy footer (the footer follows straight after it):
 * the chosen path's own start, or sign up. Signed-in people go to their dashboard.
 * `showNeedsLink`: false on the School needs page itself.
 */
const FinalCta = ({ path, showNeedsLink = true }) => {
  const { user } = useAuth();
  const own = PATHS[path];
  const primary = user ? { label: "Go to your dashboard", to: `/dashboard/${user.role}` } : own && own.primary.to !== "/needs" ? own.primary : { label: "Get started", to: "/join" };
  return (
    <section aria-labelledby="cta-heading" className="on-dark bg-brand-navy pt-12 lg:pt-16">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-6 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-10">
          <div className="max-w-2xl">
            <h2 id="cta-heading" className="text-balance font-heading text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
              Help a government school today
            </h2>
            <p className="mt-2 text-balance text-base leading-7 text-slate-300">Register as a school, an NGO or a donor, or look at what schools need first.</p>
          </div>
          <div className="grid shrink-0 gap-3 sm:flex">
            <Link
              to={primary.to}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-[15px] font-semibold text-brand-navy transition-colors hover:bg-slate-200"
            >
              {primary.label} <LuArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {showNeedsLink && (
              <Link
                to="/needs"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/30 px-5 text-[15px] font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10"
              >
                See open needs
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
