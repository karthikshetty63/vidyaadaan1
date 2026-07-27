import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { FaUpload, FaCheckCircle } from "react-icons/fa";

const categories = [
  { value: "", label: "Select Category" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "furniture", label: "Furniture" },
  { value: "digital", label: "Digital Equipment" },
  { value: "sanitation", label: "Sanitation" },
  { value: "sports", label: "Sports & Culture" },
  { value: "library", label: "Library" },
];

const priorities = [
  { value: "high", label: "High Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "low", label: "Low Priority" },
];

const CreateIssue = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", priority: "medium", description: "", estimatedCost: "", beneficiaries: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate("/school/manage-issues"), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FaCheckCircle className="text-6xl text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Issue Submitted!</h2>
          <p className="text-slate-500 mt-2">Your issue has been submitted for NGO review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Create New Issue</h1>
        <p className="text-slate-500 text-sm mt-1">Submit an infrastructure need for donor support</p>
      </div>

      <Card className="p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Issue Title" name="title" placeholder="e.g. Classroom Roof Repair" value={form.title} onChange={handleChange} required />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Category" name="category" options={categories} value={form.category} onChange={handleChange} />
            <Select label="Priority" name="priority" options={priorities} value={form.priority} onChange={handleChange} />
          </div>

          <Textarea label="Description" name="description" placeholder="Describe the issue in detail — current condition, impact on students, work required..." value={form.description} onChange={handleChange} rows={5} required />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Estimated Cost (₹)" name="estimatedCost" type="number" placeholder="e.g. 150000" value={form.estimatedCost} onChange={handleChange} required />
            <Input label="Students Benefited" name="beneficiaries" type="number" placeholder="e.g. 320" value={form.beneficiaries} onChange={handleChange} required />
          </div>

          {/* Photo Upload (UI only) */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Before Photos</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <FaUpload className="text-2xl text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-300 mt-1">PNG, JPG up to 5MB each</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" size="lg">Submit Issue</Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/school/manage-issues")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateIssue;
