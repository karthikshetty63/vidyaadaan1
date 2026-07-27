import React, { useState } from "react";
import { Link } from "react-router-dom";

const STEPS = ["Personal", "Address", "Password", "Preferences", "Review", "Success"];
const inputCls = "w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-colors font-medium";
const labelCls = "block text-xs font-bold text-slate-700 mb-1.5";

const DonorRegister = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", dob: "",
    address: "", city: "", state: "", pin: "",
    password: "", confirm: "",
    causes: [], frequency: "", anonymous: false,
    agree: false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const causes = ["Libraries", "Toilets", "Classrooms", "Digital Labs", "Mid-day Meal", "School Uniforms", "Sports Equipment", "Water & Sanitation"];
  const frequencies = ["One-time", "Monthly", "Quarterly", "Annually"];

  const steps = [
    /* Step 0: Personal */
    <div key="s0" className="flex flex-col gap-4">
      <div><label className={labelCls}>Full Name *</label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ramesh Kumar" className={inputCls} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Email Address *</label><input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" className={inputCls} /></div>
        <div><label className={labelCls}>Phone Number *</label><input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Date of Birth</label><input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className={inputCls} /></div>
    </div>,

    /* Step 1: Address */
    <div key="s1" className="flex flex-col gap-4">
      <div><label className={labelCls}>Address Line *</label><textarea value={form.address} onChange={e => set("address", e.target.value)} placeholder="Flat / House / Street..." rows={3} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-colors font-medium resize-none" /></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div><label className={labelCls}>City *</label><input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Bengaluru" className={inputCls} /></div>
        <div><label className={labelCls}>State *</label><select value={form.state} onChange={e => set("state", e.target.value)} className={inputCls}>
          <option value="">State</option>
          {["Karnataka","Tamil Nadu","Andhra Pradesh","Telangana","Kerala","Maharashtra","Gujarat","Rajasthan"].map(s => <option key={s}>{s}</option>)}
        </select></div>
        <div><label className={labelCls}>PIN Code *</label><input value={form.pin} onChange={e => set("pin", e.target.value)} placeholder="560001" className={inputCls} /></div>
      </div>
    </div>,

    /* Step 2: Password */
    <div key="s2" className="flex flex-col gap-4">
      <div><label className={labelCls}>Password *</label><input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 8 characters" className={inputCls} /></div>
      <div><label className={labelCls}>Confirm Password *</label><input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Repeat password" className={inputCls} /></div>
      {form.password && form.confirm && form.password !== form.confirm && (
        <p className="text-xs text-red-600 font-bold">❌ Passwords do not match</p>
      )}
      {form.password && form.confirm && form.password === form.confirm && (
        <p className="text-xs text-emerald-600 font-bold">✅ Passwords match</p>
      )}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
        🔒 Use at least 8 characters with a mix of letters, numbers and symbols.
      </div>
    </div>,

    /* Step 3: Preferences */
    <div key="s3" className="flex flex-col gap-5">
      <div>
        <label className={labelCls}>Preferred Causes</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {causes.map(cause => (
            <button key={cause} type="button" onClick={() => set("causes", form.causes.includes(cause) ? form.causes.filter(c => c !== cause) : [...form.causes, cause])}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${form.causes.includes(cause) ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-amber-400"}`}>
              {cause}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Preferred Donation Frequency</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {frequencies.map(f => (
            <button key={f} type="button" onClick={() => set("frequency", f)}
              className={`h-10 rounded-xl text-xs font-bold border-2 transition-all ${form.frequency === f ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.anonymous} onChange={e => set("anonymous", e.target.checked)} className="w-4 h-4 accent-amber-500 rounded" />
        <span className="text-xs text-slate-600 font-medium">I prefer to donate anonymously</span>
      </label>
    </div>,

    /* Step 4: Review */
    <div key="s4" className="flex flex-col gap-4">
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 text-sm">
        <div className="font-bold text-slate-900 mb-3">Registration Summary</div>
        {[["Name", form.name || "—"],["Email", form.email || "—"],["Phone", form.phone || "—"],["City", form.city || "—"],["State", form.state || "—"],["Causes", form.causes.join(", ") || "—"],["Frequency", form.frequency || "—"],["Anonymous", form.anonymous ? "Yes" : "No"]].map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs"><span className="text-slate-500 w-24 shrink-0">{k}:</span><span className="font-semibold text-slate-800">{v}</span></div>
        ))}
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={form.agree} onChange={e => set("agree", e.target.checked)} className="w-4 h-4 accent-amber-500 mt-0.5" />
        <span className="text-xs text-slate-600 leading-relaxed">I agree to VIDYADAAN's <span className="text-amber-600 font-bold">Terms of Service</span> and <span className="text-amber-600 font-bold">Privacy Policy</span>.</span>
      </label>
    </div>,
  ];

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6 text-5xl">💙</div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Welcome, Donor!</h1>
          <p className="text-slate-500 mb-8">Your account has been created. You can now explore schools, browse projects, and start making a difference.</p>
          <Link to="/login/donor" className="h-14 px-8 inline-flex items-center gap-2 bg-amber-500 text-white font-bold rounded-full shadow-xl shadow-amber-500/25 hover:bg-amber-600 transition-all">Login to Dashboard →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col">
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center"><span className="text-white font-black text-sm">V</span></div>
          <span className="font-black text-sm text-slate-900">VIDYADAAN</span>
        </Link>
        <span className="text-xs text-slate-500 font-semibold">Donor Registration</span>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
            {STEPS.slice(0, 5).map((label, i) => (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center gap-1 shrink-0 ${i <= step ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${i < step ? "bg-amber-400 text-white" : i === step ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"}`}>{i < step ? "✓" : i + 1}</div>
                  <span className="text-[9px] font-semibold text-slate-600 text-center max-w-[55px] leading-tight">{label}</span>
                </div>
                {i < 4 && <div className={`flex-1 h-0.5 rounded-full min-w-[12px] ${i < step ? "bg-amber-400" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-[24px] shadow-2xl shadow-amber-950/8 border border-slate-100 p-8 sm:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Step {step + 1}: {STEPS[step]}</h2>
            <p className="text-sm text-slate-500 mb-8">Fill in the details below to continue.</p>
            {steps[step]}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
              {step > 0 && <button onClick={prev} className="h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-full hover:border-amber-400 hover:text-amber-600 transition-all">← Previous</button>}
              <button onClick={next} disabled={step === 4 && !form.agree}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm rounded-full shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50">
                {step === 4 ? "Create Account" : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorRegister;
