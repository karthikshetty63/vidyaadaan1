import { Link, Navigate, useLocation } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import FinalCta from "../components/home/FinalCta";
import HomeHero from "../components/home/HomeHero";
import LatestNeeds from "../components/home/LatestNeeds";
import LearnMore from "../components/home/LearnMore";
import { readPath } from "../components/home/paths";
import SitePage from "../components/home/SitePage";
import { useAuth } from "../context/AuthContext";

// The home page's sections used to live on this page; links to them (/#needs …) now open their own pages.
const MOVED_SECTIONS = { "#needs": "/needs", "#how-it-works": "/how-it-works", "#your-path": "/take-part", "#transparency": "/transparency", "#faq": "/faq" };

/** The home page: what VIDYADAAN is, the latest real needs, where to learn more, and how to start. */
const Home = () => {
  const { hash } = useLocation();
  const { user } = useAuth();
  if (MOVED_SECTIONS[hash]) return <Navigate to={MOVED_SECTIONS[hash]} replace />;

  const start = user ? { label: "Go to your dashboard", to: `/dashboard/${user.role}` } : { label: "Get started", to: "/join" };
  const phoneBar = (
    // Phones: one clear next step, always in reach (it leaves room for the help button). The footer keeps
    // room at its very end, so this bar never covers the policy links.
    <div className="fixed bottom-4 left-4 right-24 z-30 sm:hidden">
      <Link to={start.to} className="flex h-12 items-center justify-center gap-2 rounded-md bg-brand-navy text-[15px] font-semibold text-white shadow-md shadow-slate-900/20 ring-1 ring-white/25">
        {start.label} <LuArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );

  return (
    <SitePage after={phoneBar}>
      <HomeHero start={start} />
      <LatestNeeds />
      <LearnMore />
      <FinalCta path={readPath()} />
    </SitePage>
  );
};

export default Home;
