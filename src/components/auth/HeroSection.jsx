import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-700 to-emerald-600 text-white py-16 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-4xl mx-auto text-center relative">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-8 transition-colors">
          <FaArrowLeft size={12} /> Back to Home
        </Link>

        <span className="inline-block px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-5 border border-white/20">
          Welcome to VIDYADAAN
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
          Empowering{" "}
          <span className="text-emerald-300">Government Schools</span>
        </h1>

        <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
          A transparent donation platform connecting Government Schools, Donors, and NGOs
          to improve educational infrastructure and create a better future for every student.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
