import { Link } from "react-router-dom";
import { FaArrowRight, FaPlay } from "react-icons/fa";
import Container from "../layout/Container";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-600 text-white overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <Container className="relative py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-6 border border-white/20">
            🎓 Empowering Education Across India
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Transform Government Schools Through{" "}
            <span className="text-emerald-300">Transparent Donations</span>
          </h1>

          <p className="mt-6 text-lg text-blue-100 leading-relaxed max-w-2xl">
            VIDYADAAN connects Schools, NGOs, and Donors to improve educational
            infrastructure with complete transparency, verified projects, and
            real-time impact tracking.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/donor/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg"
            >
              Donate Now <FaArrowRight size={14} />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/60 text-white font-semibold hover:bg-white/10 transition-all duration-200"
            >
              <FaPlay size={12} /> Explore Projects
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-14 flex flex-wrap gap-8">
            {[
              { value: "500+", label: "Schools" },
              { value: "₹50L+", label: "Raised" },
              { value: "20K+", label: "Students" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-blue-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
