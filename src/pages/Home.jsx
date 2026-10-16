import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import ActivityStrip from "../components/home/ActivityStrip";
import FinalCta from "../components/home/FinalCta";
import HomeFaq from "../components/home/HomeFaq";
import HomeHero from "../components/home/HomeHero";
import HowItWorks from "../components/home/HowItWorks";
import NeedsBoard from "../components/home/NeedsBoard";
import PathPanel from "../components/home/PathPanel";
import { PATHS } from "../components/home/paths";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";

// The visitor's "I am a…" choice, remembered on this device (storage can be unavailable: then it isn't).
const PATH_KEY = "vidyadaan:home-path";
const readPath = () => {
  try {
    const saved = localStorage.getItem(PATH_KEY);
    return PATHS[saved] ? saved : "";
  } catch {
    return "";
  }
};
const savePath = (path) => {
  try {
    localStorage.setItem(PATH_KEY, path);
  } catch {
    /* storage unavailable: the choice lasts until the page closes */
  }
};
const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * The home page: choose your path, see the real open needs, see what's happening, learn how it works.
 * Everything that looks like data is real (from the server); the one illustration says it's an example.
 */
const Home = () => {
  const { hash, key } = useLocation();
  const { user } = useAuth();
  const [path, setPath] = useState(readPath);

  // Links like /#needs (from the header, the footer or another page) scroll to that section.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }, [hash, key]);

  const choose = (next) => {
    setPath(next);
    savePath(next);
    // Show what the choice opened, just below.
    requestAnimationFrame(() => document.getElementById("your-path")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }));
  };

  const start = user ? { label: "Go to your dashboard", to: `/dashboard/${user.role}` } : { label: "Get started", to: "/join" };

  return (
    <div className="min-h-dvh bg-[#f4f8ff] text-slate-900 antialiased">
      <Navbar />
      <main className="space-y-20 pb-24 pt-16 lg:space-y-28">
        <div>
          <HomeHero path={path} onChoose={choose} />
          <ActivityStrip />
        </div>
        <PathPanel path={path} />
        <NeedsBoard />
        <HowItWorks />
        <HomeFaq path={path} />
        <FinalCta path={path} />
      </main>
      <Footer />

      {/* Phones: one clear next step, always in reach (it leaves room for the help button). */}
      <div className="fixed bottom-4 left-4 right-24 z-30 sm:hidden">
        <Link to={start.to} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-[15px] font-semibold text-white shadow-lg shadow-blue-900/25">
          {start.label} <LuArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default Home;
