import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleSignInModal from "../../components/auth/GoogleSignInModal";

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
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <span className="text-white font-black text-sm">VIDYADAAN</span>
        </Link>
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
  const [error, setError] = useState("");
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to sign in.");
      }

      if (data.user?.role !== "school") {
        setError("Please use the correct login page for your account.");
        return;
      }

      localStorage.removeItem("vidyaadaanUser");
      sessionStorage.removeItem("vidyaadaanUser");
      const storage = form.remember ? localStorage : sessionStorage;
      storage.setItem("vidyaadaanUser", JSON.stringify(data.user));
      navigate("/dashboard/school");
    } catch {
      setError("Unable to sign in. Please check your email and password and try again.");
    } finally {
      setLoading(false);
    }
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

      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

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

        {/* Active Google Sign-In Button */}
        <button
          type="button"
          onClick={() => setGoogleModalOpen(true)}
          className="w-full h-12 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Not registered?{" "}
          <Link to="/join/school" className="text-blue-600 font-bold hover:underline">Register School</Link>
        </p>
        <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Need Help?</button>
      </div>

      <GoogleSignInModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        defaultRole="school"
      />
    </AuthLayout>
  );
};

export default SchoolLogin;
export { AuthLayout };
