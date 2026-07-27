import { useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { FaSchool, FaEdit } from "react-icons/fa";

const schoolTypes = [
  { value: "primary", label: "Primary School" },
  { value: "high", label: "High School" },
  { value: "composite", label: "Composite School" },
];

const SchoolProfile = () => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "Govt. Higher Primary School",
    udise: "29240100101",
    district: "Dakshina Kannada",
    location: "Sullia, Karnataka",
    principal: "Ramesh Nair",
    phone: "+91 94483 12345",
    email: "ghps.sullia@karnataka.gov.in",
    students: "320",
    type: "primary",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">School Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your school's information</p>
        </div>
        <Button variant={editing ? "secondary" : "outline"} onClick={() => setEditing(!editing)}>
          <FaEdit size={13} /> {editing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <FaSchool className="text-4xl text-blue-600" />
          </div>
          <h2 className="font-bold text-slate-800">{form.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{form.location}</p>
          <Badge variant="emerald" className="mt-3">Verified School</Badge>
          <div className="mt-5 w-full space-y-2 text-sm text-left">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-slate-500">UDISE Code</span>
              <span className="font-medium text-slate-700">{form.udise}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-slate-500">Students</span>
              <span className="font-medium text-slate-700">{form.students}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">District</span>
              <span className="font-medium text-slate-700">{form.district}</span>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-5">School Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="School Name" name="name" value={form.name} onChange={handleChange} disabled={!editing} />
            <Input label="UDISE Code" name="udise" value={form.udise} onChange={handleChange} disabled={!editing} />
            <Input label="District" name="district" value={form.district} onChange={handleChange} disabled={!editing} />
            <Input label="Location" name="location" value={form.location} onChange={handleChange} disabled={!editing} />
            <Input label="Principal Name" name="principal" value={form.principal} onChange={handleChange} disabled={!editing} />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} disabled={!editing} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} disabled={!editing} />
            <Input label="Total Students" name="students" type="number" value={form.students} onChange={handleChange} disabled={!editing} />
            <Select label="School Type" name="type" options={schoolTypes} value={form.type} onChange={handleChange} disabled={!editing} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SchoolProfile;
