import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/sections/Hero";
import Stats from "../components/sections/Stats";
import About from "../components/sections/About";
import HowItWorks from "../components/sections/HowItWorks";
import FeaturedSchools from "../components/sections/FeaturedSchools";
import Partners from "../components/sections/Partners";
import Testimonials from "../components/sections/Testimonials";
import FAQ from "../components/sections/FAQ";
import Contact from "../components/sections/Contact";
import CTA from "../components/sections/CTA";

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <HowItWorks />
        <FeaturedSchools />
        <Partners />
        <Testimonials />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <Footer />
    </>
  );
};

export default Home;
