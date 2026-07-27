import { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaBuilding, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaGlobe, FaUsers, FaProjectDiagram, FaCheckCircle, FaRupeeSign } from "react-icons/fa";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const impactStats = [
  { label: "Projects Completed", value: "27", icon: FaCheckCircle, color: "text-emerald-600" },
  { label: "Active Projects", value: "12", icon: FaProjectDiagram, color: "text-blue-600" },
  { label: "Volunteers", value: "34", icon: FaUsers, color: "text-purple-600" },
  { label: "Funds Mobilized", value: "₹18.4L", icon: FaRupeeSign, color: "text-emerald-600" },
];

const teamMembers = [
  { name: "Dr. Ramesh Iyer", role: "Executive Director", avatar: "RI" },
  { name: "Meena Krishnan", role: "Program Manager", avatar: "MK" },
  { name: "Suresh Babu", role: "Field Operations Head", avatar: "SB" },
  { name: "Anita Desai", role: "Finance Manager", avatar: "AD" },
];

const avatarColors = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-purple-100 text-purple-700", "bg-slate-100 text-slate-700"];

const NGOProfile = () => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "Shiksha Foundation",
    regNumber: "NGO/KA/2018/00234",
    type: "Education NGO",
    founded: "2018",
    email: "contact@shikshafoundation.org",
    phone: "9876500001",
    website: "www.shikshafoundation.org",
    address: "42, 3rd Cross, Koramangala 5th Block",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560095",
    mission: "Empowering underprivileged children through quality education and infrastructure support in government schools across Karnataka.",
  });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const Field = ({ label, name, type = "text" }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      {editing ? (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        <p className="text-sm text-slate-800 font-medium">{form[name]}</p>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">NGO Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your organization information</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                <FaTimes size={13} /> Cancel
              </Button>
              <Button size="sm" onClick={() => setEditing(false)}>
                <FaSave size={13} /> Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <FaEdit size={13} /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Org Identity */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                SF
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{form.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="emerald">Verified NGO</Badge>
                  <Badge variant="blue">{form.type}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Organization Name" name="name" />
              <Field label="Registration Number" name="regNumber" />
              <Field label="NGO Type" name="type" />
              <Field label="Founded Year" name="founded" />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mission Statement</label>
              {editing ? (
                <textarea
                  name="mission"
                  value={form.mission}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{form.mission}</p>
              )}
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email Address" name="email" type="email" />
              <Field label="Phone Number" name="phone" />
              <Field label="Website" name="website" />
              <Field label="Pincode" name="pincode" />
              <div className="sm:col-span-2">
                <Field label="Address" name="address" />
              </div>
              <Field label="City" name="city" />
              <Field label="State" name="state" />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Impact Stats */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Impact Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {impactStats.map((s) => (
                <div key={s.label} className="text-center p-3 bg-slate-50 rounded-xl">
                  <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
                  <p className="font-bold text-slate-800 text-lg">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Team Members */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Core Team</h3>
            <div className="space-y-3">
              {teamMembers.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                    {m.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Info */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Quick Info</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><FaBuilding size={12} className="text-slate-400" /> {form.type}</div>
              <div className="flex items-center gap-2 text-slate-600"><FaEnvelope size={12} className="text-slate-400" /> {form.email}</div>
              <div className="flex items-center gap-2 text-slate-600"><FaPhoneAlt size={12} className="text-slate-400" /> {form.phone}</div>
              <div className="flex items-center gap-2 text-slate-600"><FaGlobe size={12} className="text-slate-400" /> {form.website}</div>
              <div className="flex items-center gap-2 text-slate-600"><FaMapMarkerAlt size={12} className="text-slate-400" /> {form.city}, {form.state}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NGOProfile;
