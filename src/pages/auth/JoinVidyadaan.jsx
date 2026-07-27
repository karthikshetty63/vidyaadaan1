import { FaSchool, FaDonate, FaHandsHelping } from "react-icons/fa";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import HeroSection from "../../components/auth/HeroSection";
import RoleCard from "../../components/auth/RoleCard";
import FeatureSection from "../../components/auth/FeatureSection";
import StatsSection from "../../components/auth/StatsSection";
import FooterCTA from "../../components/auth/FooterCTA";

const roles = [
  {
    icon: <FaSchool />,
    title: "School",
    description:
      "Register your government school, submit infrastructure needs, and receive verified donations with full transparency.",
    features: [
      "Submit infrastructure requirements",
      "Upload before & after photos",
      "Track donation progress",
      "Receive NGO support",
    ],
    loginTo: "/school/login",
    registerTo: "/school/register",
    color: "blue",
  },
  {
    icon: <FaDonate />,
    title: "Donor",
    description:
      "Browse verified government schools, choose projects you care about, and track the real impact of every rupee you donate.",
    features: [
      "Browse verified school projects",
      "Donate securely",
      "Track your donation impact",
      "Receive completion reports",
    ],
    loginTo: "/donor/login",
    registerTo: "/donor/register",
    color: "emerald",
  },
  {
    icon: <FaHandsHelping />,
    title: "NGO",
    description:
      "Partner with government schools, verify project requests, manage volunteers, and drive community development.",
    features: [
      "Adopt and manage schools",
      "Verify project requests",
      "Manage volunteers",
      "Generate impact reports",
    ],
    loginTo: "/ngo/login",
    registerTo: "/ngo/register",
    color: "slate",
  },
];

const JoinVidyadaan = () => {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <HeroSection />

        {/* Role Cards */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
                Choose Your Role
              </span>
              <h2 className="text-4xl font-bold text-slate-900">
                How Would You Like to Join?
              </h2>
              <p className="mt-4 text-slate-500 max-w-xl mx-auto">
                Select your role to get started. Each role has a dedicated dashboard
                and features tailored to your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roles.map((role) => (
                <RoleCard key={role.title} {...role} />
              ))}
            </div>
          </div>
        </section>

        <FeatureSection />
        <StatsSection />
        <FooterCTA />
      </main>

      <Footer />
    </>
  );
};

export default JoinVidyadaan;
