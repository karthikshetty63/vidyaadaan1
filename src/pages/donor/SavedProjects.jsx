import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import schoolsData from "../../data/schoolsData";
import { FaBookmark, FaMapMarkerAlt, FaUsers } from "react-icons/fa";

const SavedProjects = () => {
  /* Simulate saved school ids */
  const [savedIds, setSavedIds] = useState([1, 2, 4, 6]);

  const saved = schoolsData.filter((s) => savedIds.includes(s.id));

  const handleUnsave = (id) => {
    setSavedIds((prev) => prev.filter((i) => i !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Saved Projects</h1>
        <p className="text-slate-500 text-sm mt-1">
          {saved.length} school{saved.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {saved.length === 0 ? (
        <Card className="p-16 text-center">
          <FaBookmark className="text-4xl text-slate-200 mx-auto mb-4" />
          <p className="font-semibold text-slate-600">No saved projects yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            Browse schools and save the ones you want to support later.
          </p>
          <Link to="/donor/browse">
            <Button>Browse Schools</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((school) => (
            <Card key={school.id} hover className="overflow-hidden flex flex-col">
              <div className="relative">
                <img
                  src={school.image}
                  alt={school.name}
                  className="w-full h-44 object-cover"
                />
                {/* Unsave button */}
                <button
                  onClick={() => handleUnsave(school.id)}
                  title="Remove from saved"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-red-50 transition-colors duration-200"
                >
                  <FaBookmark className="text-blue-600 text-sm" />
                </button>
                <div className="absolute top-3 left-3">
                  <Badge variant={school.status === "Completed" ? "emerald" : "blue"}>
                    {school.status}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-800 mb-1">{school.name}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-blue-400" /> {school.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-emerald-400" /> {school.students}
                  </span>
                </div>

                <ProgressBar value={school.progress} showLabel={false} />
                <div className="flex justify-between text-xs text-slate-500 mt-1.5 mb-5">
                  <span>Raised: <strong className="text-emerald-600">{school.raised}</strong></span>
                  <span>Goal: <strong className="text-slate-700">{school.required}</strong></span>
                </div>

                <div className="mt-auto flex gap-2">
                  <Link to={`/donor/school/${school.id}`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth>Details</Button>
                  </Link>
                  <Link to={`/donor/donate?school=${school.id}`} className="flex-1">
                    <Button size="sm" fullWidth>Donate</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProjects;
