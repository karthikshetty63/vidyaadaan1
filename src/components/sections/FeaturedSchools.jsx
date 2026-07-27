import { Link } from "react-router-dom";
import Container from "../layout/Container";
import ProgressBar from "../ui/ProgressBar";
import Badge from "../ui/Badge";
import schoolsData from "../../data/schoolsData";
import { FaMapMarkerAlt, FaUsers } from "react-icons/fa";

const FeaturedSchools = () => {
  const featured = schoolsData.slice(0, 3);

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-4">
            Featured Schools
          </span>
          <h2 className="text-4xl font-bold text-slate-900">
            Schools That Need Your Support
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            Support verified government schools and track the real impact of your donation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((school) => (
            <div
              key={school.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={school.image}
                  alt={school.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={school.status === "Completed" ? "emerald" : "blue"}>
                    {school.status}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{school.name}</h3>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-blue-400" /> {school.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-emerald-400" /> {school.students}
                  </span>
                </div>

                <ProgressBar value={school.progress} />

                <div className="flex justify-between text-sm mt-3 mb-5">
                  <span className="text-slate-500">Raised: <strong className="text-slate-800">{school.raised}</strong></span>
                  <span className="text-slate-500">Goal: <strong className="text-slate-800">{school.required}</strong></span>
                </div>

                <Link
                  to={`/donor/donate`}
                  className="block w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200 text-sm"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200"
          >
            View All Schools
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default FeaturedSchools;
