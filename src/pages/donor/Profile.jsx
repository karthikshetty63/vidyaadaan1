import { useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { FaUserCircle, FaEdit, FaDonate, FaSchool, FaHeart } from "react-icons/fa";

const DonorProfile = () => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    city: "Bengaluru",
    state: "Karnataka",
    pan: "ABCDE1234F",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    setEditing(false);
  };

  const impactStats = [
    { label: "Total Donated", value: "₹75,000", icon: FaDonate, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Schools Supported", value: "4", icon: FaSchool, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Impact Score", value: "92/100", icon: FaHeart, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your donor account</p>
        </div>
        <Button
          variant={editing ? "secondary" : "outline"}
          onClick={editing ? handleSave : () => setEditing(true)}
        >
          <FaEdit size={13} /> {editing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar + Impact */}
        <div className="space-y-5">
          {/* Avatar Card */}
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <FaUserCircle className="text-5xl text-blue-500" />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">{form.name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{form.email}</p>
            <Badge variant="emerald" className="mt-3">Verified Donor</Badge>
            <p className="text-xs text-slate-400 mt-3">Member since Jan 2024</p>
          </Card>

          {/* Impact Stats */}
          {impactStats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`text-lg ${color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Edit Form */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-5">Personal Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={!editing}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={!editing}
            />
            <Input
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={!editing}
            />
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              disabled={!editing}
            />
            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              disabled={!editing}
            />
            <Input
              label="PAN Number (for 80G)"
              name="pan"
              value={form.pan}
              onChange={handleChange}
              disabled={!editing}
              placeholder="For tax exemption certificate"
            />
          </div>

          {editing && (
            <div className="mt-5 pt-5 border-t border-gray-100 flex gap-3">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          )}

          {/* Tax Info */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h3 className="font-bold text-slate-800 mb-3">Tax Exemption</h3>
            <p className="text-sm text-slate-500 leading-6">
              Donations made through VIDYADAAN to eligible NGO partners may qualify for
              tax deductions under <strong>Section 80G</strong> of the Income Tax Act.
              Ensure your PAN is updated to receive your certificate.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DonorProfile;
