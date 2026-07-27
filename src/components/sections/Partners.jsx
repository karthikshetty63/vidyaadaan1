import Container from "../layout/Container";
import partnersData from "../../data/partnersData";

const Partners = () => {
  return (
    <section className="py-16 bg-slate-50">
      <Container>
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
            Our Partners
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Trusted NGO Partners</h2>
          <p className="mt-3 text-slate-500 text-sm max-w-lg mx-auto">
            We work with India's most trusted NGOs to verify and execute school projects.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6">
          {partnersData.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-10 object-contain"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Partners;
