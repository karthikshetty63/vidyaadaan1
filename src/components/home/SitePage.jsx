import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../layout/Footer";
import Navbar from "../layout/Navbar";

/**
 * The frame of the home page and its pages (School needs, How it works, …): header, page, footer.
 * Every page opens at its top, and the browser tab says which page it is (`title`; none on the home page).
 * `after` is rendered after the footer (the home page's phone bar).
 */
const SitePage = ({ title, children, after = null }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!title) return undefined;
    const previous = document.title;
    document.title = `${title} | VIDYADAAN`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <div className="site-theme min-h-dvh bg-white text-slate-900 antialiased">
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
      {after}
    </div>
  );
};

export default SitePage;
