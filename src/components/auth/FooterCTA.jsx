import { Link } from "react-router-dom";

const FooterCTA = () => {
  return (
    <section className="bg-gradient-to-r from-blue-700 to-emerald-600 py-20">
      <div className="max-w-5xl mx-auto text-center px-6 text-white">
        <h2 className="text-4xl font-bold mb-5">
          Together, We Can Transform Government Schools
        </h2>
        <p className="text-lg mb-10 text-blue-100 leading-relaxed">
          Join VIDYADAAN today as a School, Donor, or NGO and make a lasting
          impact on students' lives across India.
        </p>
        <Link
          to="/join"
          className="inline-block bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
        >
          Get Started Today
        </Link>
      </div>
    </section>
  );
};

export default FooterCTA;
