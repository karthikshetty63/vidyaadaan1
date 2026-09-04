import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAccount } from "../../api/auth";

const STEPS = [
  "School Info",
  "Principal",
  "Infrastructure",
  "Documents",
  "Bank Details",
  "Review",
  "Success",
];

const SchoolRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    schoolName: "", udise: "", address: "", district: "", state: "",
    principalName: "", email: "", phone: "", password: "", students: "", teachers: "",
    hasToilets: false, hasLibrary: false, hasComputers: false, hasDrinkingWater: false,
    bankAccount: "", ifsc: "", upi: "",
    agree: false,
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await registerAccount({ ...form, role: "school" });
      next();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors font-medium";
  const labelCls = "block text-xs font-bold text-slate-700 mb-1.5";

  const steps = [
    /* Step 0: School Info */
    <div key="s0" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>School Name *</label><input value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} placeholder="Govt. Primary School, Honnali" className={inputCls} /></div>
        <div><label className={labelCls}>UDISE Code *</label><input value={form.udise} onChange={(e) => set("udise", e.target.value)} placeholder="12345678901234" className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Full Address *</label><textarea value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="School building, Village, Taluk" rows={3} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors font-medium resize-none" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>District *</label><input value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="Mandya" className={inputCls} /></div>
        <div><label className={labelCls}>State *</label><select value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls}>
          <option value="">Select State</option>
          {["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Kerala", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Bihar"].map(s => <option key={s}>{s}</option>)}
        </select></div>
      </div>
    </div>,

    /* Step 1: Principal */
    <div key="s1" className="flex flex-col gap-4">
      <div><label className={labelCls}>Principal Name *</label><input value={form.principalName} onChange={(e) => set("principalName", e.target.value)} placeholder="Mr. / Ms. Full Name" className={inputCls} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Official Email *</label><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="principal@school.gov.in" className={inputCls} /></div>
        <div><label className={labelCls}>Phone Number *</label><input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Password *</label><input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 6 characters" className={inputCls} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Total Students</label><input type="number" value={form.students} onChange={(e) => set("students", e.target.value)} placeholder="250" className={inputCls} /></div>
        <div><label className={labelCls}>Total Teachers</label><input type="number" value={form.teachers} onChange={(e) => set("teachers", e.target.value)} placeholder="12" className={inputCls} /></div>
      </div>
    </div>,

    /* Step 2: Infrastructure */
    <div key="s2" className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">Select the facilities that your school currently has:</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "hasToilets", label: "Functional Toilets", icon: "🚻" },
          { key: "hasLibrary", label: "Library", icon: "📚" },
          { key: "hasComputers", label: "Computer Lab", icon: "💻" },
          { key: "hasDrinkingWater", label: "Drinking Water", icon: "💧" },
        ].map(({ key, label, icon }) => (
          <label key={key} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form[key] ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"}`}>
            <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <span className="text-base">{icon}</span>
            <span className="text-xs font-bold text-slate-800">{label}</span>
          </label>
        ))}
      </div>
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800 font-medium">
        📸 School photos can be uploaded after registration from your dashboard.
      </div>
    </div>,

    /* Step 3: Documents */
    <div key="s3" className="flex flex-col gap-5">
      {[
        { label: "School Registration Certificate", desc: "PDF or Image" },
        { label: "Principal ID Proof", desc: "Aadhaar / Govt ID" },
        { label: "School Photograph", desc: "JPG/PNG, max 5MB" },
      ].map(({ label, desc }) => (
        <div key={label}>
          <label className={labelCls}>{label}</label>
          <div className="flex items-center gap-3 h-12 px-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-slate-400 text-xs font-medium">📁 Click to upload — {desc}</span>
          </div>
        </div>
      ))}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-sm text-blue-800 font-medium">
        🔒 All documents are encrypted and stored securely. Only verified NGOs can view them.
      </div>
    </div>,

    /* Step 4: Bank */
    <div key="s4" className="flex flex-col gap-4">
      <div><label className={labelCls}>Bank Account Number *</label><input value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} placeholder="1234567890123" className={inputCls} /></div>
      <div><label className={labelCls}>IFSC Code *</label><input value={form.ifsc} onChange={(e) => set("ifsc", e.target.value)} placeholder="SBIN0001234" className={inputCls} /></div>
      <div><label className={labelCls}>UPI ID (Optional)</label><input value={form.upi} onChange={(e) => set("upi", e.target.value)} placeholder="school@upi" className={inputCls} /></div>
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium">
        ✅ Funds are released directly to the school account only after NGO verification of project completion.
      </div>
    </div>,

    /* Step 5: Review */
    <div key="s5" className="flex flex-col gap-4">
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 text-sm">
        <div className="font-bold text-slate-900 mb-3">Registration Summary</div>
        {[["School", form.schoolName || "—"], ["UDISE", form.udise || "—"], ["District", form.district || "—"], ["State", form.state || "—"], ["Principal", form.principalName || "—"], ["Email", form.email || "—"], ["Students", form.students || "—"], ["Teachers", form.teachers || "—"],].map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs"><span className="text-slate-500 w-20 shrink-0">{k}:</span><span className="font-semibold text-slate-800">{v}</span></div>
        ))}
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} className="w-4 h-4 accent-blue-600 mt-0.5" />
        <span className="text-xs text-slate-600 leading-relaxed">I declare that all information provided is accurate and I agree to VIDYADAAN's <span className="text-blue-600 font-bold">Terms of Service</span> and <span className="text-blue-600 font-bold">Privacy Policy</span>.</span>
      </label>
    </div>,
  ];

  if (step === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-5xl">✅</div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Registration Submitted!</h1>
          <p className="text-slate-500 mb-8">Your school has been registered and is <span className="font-bold text-amber-600">pending admin approval</span>. Our team will verify your details and activate your account. You will be able to log in only after approval.</p>
          <Link to="/login/school" className="h-14 px-8 inline-flex items-center gap-2 bg-blue-600 text-white font-bold rounded-full shadow-xl shadow-blue-600/25 hover:bg-blue-700 transition-all">Proceed to School Login →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col">
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><span className="text-white font-black text-sm">V</span></div>
          <span className="font-black text-sm text-slate-900">VIDYADAAN</span>
        </Link>
        <span className="text-xs text-slate-500 font-semibold">School Registration</span>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Steps */}
          <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
            {STEPS.slice(0, 6).map((label, i) => (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center gap-1 shrink-0 ${i <= step ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center max-w-[60px] leading-tight">{label}</span>
                </div>
                {i < 5 && <div className={`flex-1 h-0.5 rounded-full min-w-[16px] ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-[24px] shadow-2xl shadow-blue-950/8 border border-slate-100 p-8 sm:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Step {step + 1}: {STEPS[step]}</h2>
            <p className="text-sm text-slate-500 mb-8">Fill in the details below to continue.</p>
            {steps[step]}
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
              {step > 0 && (
                <button onClick={prev} className="h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-full hover:border-blue-400 hover:text-blue-600 transition-all">← Previous</button>
              )}
              <button onClick={step === 5 ? handleSubmit : next}
                disabled={step === 5 && (!form.agree || loading)}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Submitting..." : step === 5 ? "Submit Registration" : `Continue →`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolRegister;
