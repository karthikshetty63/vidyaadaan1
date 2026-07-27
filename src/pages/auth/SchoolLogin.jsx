import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AuthLayout = ({ image, quote, children }) => (
  <div className="min-h-screen flex">
    {/* Left Panel — Image */}
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <img src={image} alt="School" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-800/40 to-transparent" />
      <div className="absolute bottom-12 left-10 right-10 text-white">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
          <span className="text-2xl">📚</span>
        </div>
        <p className="text-xl font-bold leading-snug mb-3 italic">"{quote}"</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-white/60 rounded" />
          <span className="text-sm text-white/80 font-medium">VIDYADAAN Platform</span>
        </div>
      </div>
      {/* Brand overlay top-left */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
          <span className="text-white font-black text-sm">V</span>
        </div>
        <span className="text-white font-black text-sm">VIDYADAAN</span>
      </div>
    </div>

    {/* Right Panel — Form */}
    <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-14 xl:px-20 py-12 bg-white">
      <div className="max-w-md w-full mx-auto">
        {/* Mobile brand */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <span className="font-black text-slate-900">VIDYADAAN</span>
        </Link>
        {children}
      </div>
    </div>
  </div>
);

const SchoolLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard/school");
    }, 1200);
  };

  return (
    <AuthLayout
      image="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=900&auto=format&fit=crop"
      quote="Every transparent update inspires another donor."
    >
      <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-semibold mb-8 transition-colors">
        ← Back to role selection
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4">
          🏫 School Admin Login
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-sm">Sign in to manage your school's development projects.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">School Email / UDISE Code</label>
          <input
            type="text"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="school@example.gov.in or UDISE123456"
            className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-400 font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span className="text-xs text-slate-600 font-medium">Remember Me</span>
          </label>
          <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm rounded-full shadow-xl shadow-blue-600/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</>
          ) : "Login to Dashboard"}
        </button>

        <button
          type="button"
          disabled
          className="w-full h-12 bg-slate-50 border-2 border-slate-200 text-slate-400 font-bold text-xs rounded-full flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <span>🔵</span> Google Login — Coming Soon
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Not registered?{" "}
          <Link to="/join/school" className="text-blue-600 font-bold hover:underline">Register School</Link>
        </p>
        <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Need Help?</button>
      </div>
    </AuthLayout>
  );
};

export default SchoolLogin;
export { AuthLayout };
