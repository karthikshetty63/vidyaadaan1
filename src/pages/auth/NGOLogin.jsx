import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./SchoolLogin";

const NGOLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/dashboard/ngo"); }, 1200);
  };

  return (
    <AuthLayout
      image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=900&auto=format&fit=crop"
      quote="Together we create opportunities that transform young lives."
    >
      <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 font-semibold mb-8 transition-colors">
        ← Back to role selection
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4">
          🤝 NGO Partner Login
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-sm">Sign in to manage your NGO's school projects and volunteers.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">NGO Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="ngo@organisation.org"
            className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-400 font-medium" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-400 font-medium" />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="w-4 h-4 accent-emerald-600 rounded" />
            <span className="text-xs text-slate-600 font-medium">Remember Me</span>
          </label>
          <button type="button" className="text-xs font-bold text-emerald-600 hover:underline">Forgot Password?</button>
        </div>
        <button type="submit" disabled={loading}
          className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm rounded-full shadow-xl shadow-emerald-600/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</> : "Login to NGO Dashboard"}
        </button>
        <button type="button" disabled className="w-full h-12 bg-slate-50 border-2 border-slate-200 text-slate-400 font-bold text-xs rounded-full flex items-center justify-center gap-2 cursor-not-allowed">
          <span>🔵</span> Google Login — Coming Soon
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Not registered? <Link to="/join/ngo" className="text-emerald-600 font-bold hover:underline">Register NGO</Link>
        </p>
        <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Need Help?</button>
      </div>
    </AuthLayout>
  );
};

export default NGOLogin;
