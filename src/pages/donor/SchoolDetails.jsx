import { useParams, Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import schoolsData from "../../data/schoolsData";
import { FaArrowLeft, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaBuilding } from "react-icons/fa";

/* Per-school dummy projects */
const schoolProjects = {
  1: [
    { id: 1, title: "Classroom Roof Repair", category: "Infrastructure", raised: 65000, goal: 100000, progress: 65, status: "Active" },
    { id: 2, title: "New Desks & Benches", category: "Furniture", raised: 10000, goal: 50000, progress: 20, status: "Active" },
  ],
  2: [
    { id: 3, title: "Digital Library Setup", category: "Digital", raised: 90000, goal: 180000, progress: 50, status: "Active" },
  ],
  3: [
    { id: 4, title: "Toilet Block Renovation", category: "Sanitation", raised: 120000, goal: 120000, progress: 100, status: "Completed" },
  ],
  4: [
    { id: 5, title: "Science Lab Equipment", category: "Education", raised: 60000, goal: 200000, progress: 30, status: "Active" },
  ],
  5: [],
  6: [
    { id: 6, title: "Playground Development", category: "Sports", raised: 40000, goal: 150000, progress: 27, status: "Active" },
  ],
};

const statusVariant = { Active: "blue", Completed: "emerald" };

const SchoolDetails = () => {
  const { id } = useParams();
  const school = schoolsData.find((s) => s.id === Number(id)) || schoolsData[0];
  const projects = schoolProjects[school.id] || [];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/donor/browse"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <FaArrowLeft size={11} /> Back to Browse
      </Link>

      {/* Hero Card */}
      <Card className="overflow-hidden">
        <img
          src={school.image}
          alt={school.name}
          className="w-full h-52 object-cover"
        />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-slate-800">{school.name}</h1>
                <Badge variant={school.status === "Completed" ? "emerald" : "blue"}>
                  {school.status}
                </Badge>
                <Badge variant="slate">{school.category}</Badge>
              </div>
              <div className="flex items-center gap-5 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-blue-400" /> {school.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaBuilding className="text-blue-400" /> {school.district}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaUsers className="text-emerald-400" /> {school.students} students
                </span>
              </div>
            </div>
            <Link to={`/donor/donate?school=${school.id}`}>
              <Button size="lg">Donate Now</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="font-bold text-slate-800 text-lg">Active Projects</h2>

          {projects.length === 0 ? (
            <Card className="p-8 text-center text-slate-400">
              <FaCheckCircle className="text-3xl text-emerald-400 mx-auto mb-2" />
              <p className="font-medium text-slate-600">All projects completed!</p>
              <p className="text-sm mt-1">This school has no active funding needs right now.</p>
            </Card>
          ) : (
            projects.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{p.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
                  </div>
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                </div>
                <ProgressBar value={p.progress} />
                <div className="flex justify-between text-xs text-slate-500 mt-2 mb-4">
                  <span>Raised: <strong className="text-emerald-600">₹{p.raised.toLocaleString()}</strong></span>
                  <span>Goal: <strong className="text-slate-700">₹{p.goal.toLocaleString()}</strong></span>
                </div>
                <Link to={`/donor/donate?school=${school.id}&project=${p.id}`}>
                  <Button size="sm" variant={p.status === "Completed" ? "ghost" : "primary"} disabled={p.status === "Completed"}>
                    {p.status === "Completed" ? "Fully Funded ✓" : "Donate to This Project"}
                  </Button>
                </Link>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-5">
          {/* Overall Funding */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">Overall Funding</h3>
            <ProgressBar value={school.progress} />
            <div className="flex justify-between text-sm mt-3">
              <div>
                <p className="text-xs text-slate-400">Raised</p>
                <p className="font-bold text-emerald-600">{school.raised}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Goal</p>
                <p className="font-bold text-slate-800">{school.required}</p>
              </div>
            </div>
          </Card>

          {/* Needs */}
          {school.needs.length > 0 && (
            <Card className="p-5">
              <h3 className="font-bold text-slate-800 mb-3">Current Needs</h3>
              <div className="flex flex-wrap gap-2">
                {school.needs.map((n) => (
                  <span key={n} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-xl font-medium">
                    {n}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* School Info */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-3">School Info</h3>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "District", value: school.district },
                { label: "Type", value: school.category },
                { label: "Students", value: school.students },
                { label: "Location", value: school.location },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-medium text-slate-700">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetails;
