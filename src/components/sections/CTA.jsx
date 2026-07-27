import { Link } from "react-router-dom";
import Container from "../layout/Container";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-700 to-emerald-600">
      <Container>
        <div className="text-center text-white max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-5">
            Together, We Can Transform Government Schools
          </h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Join VIDYADAAN today as a School, Donor, or NGO and make a lasting
            impact on thousands of students' lives across India.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/join"
              className="px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
            >
              Get Started Today
            </Link>
            <Link
              to="/about"
              className="px-8 py-3.5 rounded-xl border-2 border-white/60 text-white font-semibold hover:bg-white/10 transition-colors duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
