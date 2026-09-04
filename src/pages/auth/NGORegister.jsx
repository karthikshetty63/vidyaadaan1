import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerAccount } from "../../api/auth";

const STEPS = ["Organisation", "Mission", "Registration", "Address", "Contact", "Documents", "Review", "Success"];

const inputCls = "w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none transition-colors font-medium";
const labelCls = "block text-xs font-bold text-slate-700 mb-1.5";

const NGORegister = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    ngoName: "", type: "", established: "", website: "", mission: "",
    focus: [], regNumber: "", regDate: "", pan: "",
    address: "", district: "", state: "",
    contactName: "", email: "", phone: "", altPhone: "", password: "",
    agree: false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await registerAccount({ ...form, role: "ngo" });
      next();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const focusAreas = ["Education", "Literacy", "Health", "Nutrition", "WASH", "Digital Literacy", "Sports", "Vocational"];

  const steps = [
    /* Step 0: Organisation */
    <div key="s0" className="flex flex-col gap-4">
      <div><label className={labelCls}>NGO / Organisation Name *</label><input value={form.ngoName} onChange={e => set("ngoName", e.target.value)} placeholder="Shiksha Foundation" className={inputCls} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Organisation Type</label><select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
          <option value="">Select Type</option>
          {["Trust", "Society", "Section 8 Company", "Others"].map(t => <option key={t}>{t}</option>)}
        </select></div>
        <div><label className={labelCls}>Year Established</label><input type="number" value={form.established} onChange={e => set("established", e.target.value)} placeholder="2010" className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Website (Optional)</label><input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://shikshafoundation.org" className={inputCls} /></div>
    </div>,

    /* Step 1: Mission */
    <div key="s1" className="flex flex-col gap-4">
      <div><label className={labelCls}>Mission Statement *</label><textarea value={form.mission} onChange={e => set("mission", e.target.value)} placeholder="Describe your NGO's mission in education..." rows={4} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none transition-colors font-medium resize-none" /></div>
      <div>
        <label className={labelCls}>Focus Areas (select all that apply)</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {focusAreas.map(area => (
            <button key={area} type="button" onClick={() => set("focus", form.focus.includes(area) ? form.focus.filter(f => f !== area) : [...form.focus, area])}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${form.focus.includes(area) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"}`}>
              {area}
            </button>
          ))}
        </div>
      </div>
    </div>,

    /* Step 2: Registration */
    <div key="s2" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Registration Number *</label><input value={form.regNumber} onChange={e => set("regNumber", e.target.value)} placeholder="NGO/2010/REG/12345" className={inputCls} /></div>
        <div><label className={labelCls}>Registration Date *</label><input type="date" value={form.regDate} onChange={e => set("regDate", e.target.value)} className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>PAN Number *</label><input value={form.pan} onChange={e => set("pan", e.target.value)} placeholder="ABCDE1234F" className={inputCls} /></div>
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
        ✅ Your registration details will be verified by our compliance team before account activation.
      </div>
    </div>,

    /* Step 3: Address */
    <div key="s3" className="flex flex-col gap-4">
      <div><label className={labelCls}>Registered Address *</label><textarea value={form.address} onChange={e => set("address", e.target.value)} placeholder="Full address including pin code" rows={3} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none transition-colors font-medium resize-none" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>District *</label><input value={form.district} onChange={e => set("district", e.target.value)} placeholder="Bengaluru Urban" className={inputCls} /></div>
        <div><label className={labelCls}>State *</label><select value={form.state} onChange={e => set("state", e.target.value)} className={inputCls}>
          <option value="">Select State</option>
          {["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Kerala", "Maharashtra", "Gujarat", "Rajasthan"].map(s => <option key={s}>{s}</option>)}
        </select></div>
      </div>
    </div>,

    /* Step 4: Contact */
    <div key="s4" className="flex flex-col gap-4">
      <div><label className={labelCls}>Primary Contact Name *</label><input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Programme Director" className={inputCls} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Official Email *</label><input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contact@ngo.org" className={inputCls} /></div>
        <div><label className={labelCls}>Phone *</label><input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Password *</label><input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 6 characters" className={inputCls} /></div>
      <div><label className={labelCls}>Alternate Phone</label><input type="tel" value={form.altPhone} onChange={e => set("altPhone", e.target.value)} placeholder="+91 98765 43210" className={inputCls} /></div>
    </div>,

    /* Step 5: Documents */
    <div key="s5" className="flex flex-col gap-5">
      {["Registration Certificate", "12A / 80G Certificate", "Annual Report (Last Year)", "PAN Card"].map(doc => (
        <div key={doc}>
          <label className={labelCls}>{doc}</label>
          <div className="flex items-center gap-3 h-12 px-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-emerald-400 transition-colors">
            <span className="text-slate-400 text-xs font-medium">📁 Click to upload — PDF or Image, max 5MB</span>
          </div>
        </div>
      ))}
    </div>,

    /* Step 6: Review */
    <div key="s6" className="flex flex-col gap-4">
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 text-sm">
        <div className="font-bold text-slate-900 mb-3">NGO Registration Summary</div>
        {[["NGO Name", form.ngoName || "—"], ["Type", form.type || "—"], ["Reg. No.", form.regNumber || "—"], ["PAN", form.pan || "—"], ["State", form.state || "—"], ["Email", form.email || "—"], ["Focus", form.focus.join(", ") || "—"]].map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs"><span className="text-slate-500 w-20 shrink-0">{k}:</span><span className="font-semibold text-slate-800">{v}</span></div>
        ))}
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={form.agree} onChange={e => set("agree", e.target.checked)} className="w-4 h-4 accent-emerald-600 mt-0.5" />
        <span className="text-xs text-slate-600 leading-relaxed">I declare all information is accurate and agree to VIDYADAAN's <span className="text-emerald-600 font-bold">Terms of Service</span> and <span className="text-emerald-600 font-bold">Privacy Policy</span>.</span>
      </label>
    </div>,
  ];

  if (step === 7) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-5xl">🎉</div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">NGO Registered!</h1>
          <p className="text-slate-500 mb-8">Your NGO has been registered and is <span className="font-bold text-amber-600">pending admin approval</span>. Our compliance team will verify your NGO and activate your account. You will be able to log in only after approval.</p>
          <Link to="/login/ngo" className="h-14 px-8 inline-flex items-center gap-2 bg-emerald-600 text-white font-bold rounded-full shadow-xl shadow-emerald-600/25 hover:bg-emerald-700 transition-all">Proceed to NGO Login →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col">
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center"><span className="text-white font-black text-sm">V</span></div>
          <span className="font-black text-sm text-slate-900">VIDYADAAN</span>
        </Link>
        <span className="text-xs text-slate-500 font-semibold">NGO Registration</span>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Step Indicator */}
          <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
            {STEPS.slice(0, 7).map((label, i) => (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center gap-1 shrink-0 ${i <= step ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>{i < step ? "✓" : i + 1}</div>
                  <span className="text-[9px] font-semibold text-slate-600 text-center max-w-[55px] leading-tight">{label}</span>
                </div>
                {i < 6 && <div className={`flex-1 h-0.5 rounded-full min-w-[12px] ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-[24px] shadow-2xl shadow-emerald-950/8 border border-slate-100 p-8 sm:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Step {step + 1}: {STEPS[step]}</h2>
            <p className="text-sm text-slate-500 mb-8">Fill in the details below to continue.</p>
            {steps[step]}
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
              {step > 0 && <button onClick={prev} className="h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-full hover:border-emerald-400 hover:text-emerald-600 transition-all">← Previous</button>}
              <button onClick={step === 6 ? handleSubmit : next} disabled={step === 6 && (!form.agree || loading)}
                className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-emerald-600 transition-all disabled:opacity-50">
                {loading ? "Submitting..." : step === 6 ? "Submit Registration" : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NGORegister;
