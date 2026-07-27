import { useState } from "react";
import { FaSearch, FaSchool, FaMapMarkerAlt, FaUsers, FaEye, FaPhoneAlt } from "react-icons/fa";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const schools = [
  { id: 1, name: "Govt. Primary School, Koramangala", district: "Bengaluru Urban", students: 320, principal: "Mrs. Lakshmi Devi", phone: "9876543210", status: "active", projects: 3, lastVisit: "15 Nov 2025", category: "Primary" },
  { id: 2, name: "Zilla Parishad School, Whitefield", district: "Bengaluru Urban", students: 480, principal: "Mr. Rajan Kumar", phone: "9876543211", status: "active", projects: 2, lastVisit: "10 Nov 2025", category: "High School" },
  { id: 3, name: "Govt. Primary School, Yelahanka", district: "Bengaluru North", students: 210, principal: "Mrs. Sunita Rao", phone: "9876543212", status: "pending", projects: 1, lastVisit: "01 Nov 2025", category: "Primary" },
  { id: 4, name: "Govt. High School, Hebbal", district: "Bengaluru North", students: 560, principal: "Mr. Venkatesh", phone: "9876543213", status: "active", projects: 4, lastVisit: "20 Oct 2025", category: "High School" },
  { id: 5, name: "Govt. Composite School, Devanahalli", district: "Bengaluru Rural", students: 390, principal: "Mrs. Kavitha S.", phone: "9876543214", status: "inactive", projects: 0, lastVisit: "05 Sep 2025", category: "Composite" },
  { id: 6, name: "Zilla Parishad School, Doddaballapur", district: "Bengaluru Rural", students: 275, principal: "Mr. Suresh Babu", phone: "9876543215", status: "pending", projects: 1, lastVisit: "12 Oct 2025", category: "Primary" },
];

const statusVariant = { active: "emerald", pending: "yellow", inactive: "slate" };
const tabs = ["All", "Active", "Pending", "Inactive"];

const ManageSchools = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filtered = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "All" || s.status === activeTab.toLowerCase();
    return matchSearch && matchTab;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Schools</h1>
          <p className="text-slate-500 text-sm mt-1">{schools.length} schools under your NGO</p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search schools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === t ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Schools", value: schools.length, color: "text-blue-600" },
          { label: "Active", value: schools.filter(s => s.status === "active").length, color: "text-emerald-600" },
          { label: "Pending", value: schools.filter(s => s.status === "pending").length, color: "text-yellow-600" },
          { label: "Inactive", value: schools.filter(s => s.status === "inactive").length, color: "text-slate-500" },
        ].map((item) => (
          <Card key={item.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* School Cards */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FaSchool size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No schools found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((school) => (
            <Card key={school.id} hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FaSchool size={18} className="text-blue-600" />
                </div>
                <Badge variant={statusVariant[school.status]} className="capitalize">{school.status}</Badge>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm leading-snug">{school.name}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <FaMapMarkerAlt size={10} /> {school.district}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1"><FaUsers size={10} className="text-slate-400" /> {school.students} students</div>
                <div className="flex items-center gap-1"><FaPhoneAlt size={10} className="text-slate-400" /> {school.phone}</div>
                <div><span className="text-slate-400">Projects:</span> <span className="font-semibold text-blue-600">{school.projects}</span></div>
                <div><span className="text-slate-400">Last visit:</span> {school.lastVisit}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Principal:</span> {school.principal}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" fullWidth>
                  <FaEye size={12} /> View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageSchools;
