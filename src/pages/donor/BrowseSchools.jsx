import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import schoolsData from "../../data/schoolsData";
import { FaSearch, FaMapMarkerAlt, FaUsers, FaFilter } from "react-icons/fa";

const categories = ["All", "Primary", "High School", "Composite"];

const BrowseSchools = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = schoolsData.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Browse Schools</h1>
        <p className="text-slate-500 text-sm mt-1">
          {filtered.length} verified government schools need your support
        </p>
      </div>

      {/* Search + Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2.5 gap-2 flex-1">
            <FaSearch className="text-slate-400 text-sm shrink-0" />
            <input
              type="text"
              placeholder="Search by school name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-slate-400 text-sm shrink-0" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  category === c
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* School Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((school) => (
          <Card key={school.id} hover className="overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative">
              <img
                src={school.image}
                alt={school.name}
                className="w-full h-44 object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge variant={school.status === "Completed" ? "emerald" : "blue"}>
                  {school.status}
                </Badge>
              </div>
              <div className="absolute top-3 left-3">
                <Badge variant="slate">{school.category}</Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-slate-800 mb-1">{school.name}</h3>

              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-blue-400" /> {school.location}
                </span>
                <span className="flex items-center gap-1">
                  <FaUsers className="text-emerald-400" /> {school.students} students
                </span>
              </div>

              {/* Needs tags */}
              {school.needs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {school.needs.slice(0, 3).map((n) => (
                    <span key={n} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-lg font-medium">
                      {n}
                    </span>
                  ))}
                </div>
              )}

              <ProgressBar value={school.progress} showLabel={false} />
              <div className="flex justify-between text-xs text-slate-500 mt-1.5 mb-5">
                <span>
                  Raised: <strong className="text-emerald-600">{school.raised}</strong>
                </span>
                <span>
                  Goal: <strong className="text-slate-700">{school.required}</strong>
                </span>
              </div>

              <div className="mt-auto flex gap-2">
                <Link to={`/donor/school/${school.id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    View Details
                  </Button>
                </Link>
                <Link to={`/donor/donate?school=${school.id}`} className="flex-1">
                  <Button size="sm" fullWidth>
                    Donate
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-20 text-slate-400">
            <FaSearch className="text-4xl mx-auto mb-3 opacity-30" />
            <p className="font-medium">No schools found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseSchools;
