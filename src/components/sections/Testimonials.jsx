import Container from "../layout/Container";
import testimonialData from "../../data/testimonialData";
import { FaQuoteLeft } from "react-icons/fa";

const Testimonials = () => {
  return (
    <section className="py-20 bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl font-bold text-slate-900">What People Say</h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            Real stories from schools, donors, and NGOs who have experienced the VIDYADAAN difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-7">
          {testimonialData.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <FaQuoteLeft className="text-blue-200 text-3xl mb-4" />
              <p className="text-slate-600 leading-7 mb-6">{t.message}</p>
              <div className="flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                />
                <div>
                  <p className="font-semibold text-slate-800">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role} · {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
