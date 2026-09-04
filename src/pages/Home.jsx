import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/sections/Hero";
import Stats from "../components/sections/Stats";
import WhySection from "../components/sections/WhySection";
import ImpactStories from "../components/sections/ImpactStories";
import FeaturedProjects from "../components/sections/FeaturedProjects";
import HowItWorks from "../components/sections/HowItWorks";
import MeetChildren from "../components/sections/MeetChildren";
import CTA from "../components/sections/CTA";
import FAQ from "../components/sections/FAQ";
import Contact from "../components/sections/Contact";

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <WhySection />
        <ImpactStories />
        <FeaturedProjects />
        <HowItWorks />
        <MeetChildren />
        <CTA />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Home;
