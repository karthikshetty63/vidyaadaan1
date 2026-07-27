import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const sampleAccounts = [
  {
    name: "Rohith (School Admin)",
    email: "rohith.schooladmin@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    role: "school",
    redirect: "/dashboard/school",
    badge: "Honnali Govt. Primary School",
  },
  {
    name: "Shiksha Seva Foundation",
    email: "shikshaseva.ngo@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    role: "ngo",
    redirect: "/dashboard/ngo",
    badge: "Verified NGO Partner",
  },
  {
    name: "Ramesh Kumar",
    email: "ramesh.donor@gmail.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
    role: "donor",
    redirect: "/dashboard/donor",
    badge: "Champion Donor",
  },
];

const GoogleSignInModal = ({ isOpen, onClose, defaultRole = null }) => {
  const navigate = useNavigate();
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = (acc) => {
    setSelectedAcc(acc);
    setSigningIn(true);

    setTimeout(() => {
      setSigningIn(false);
      onClose();
      // Navigate to target dashboard based on role or defaultRole
      const target = defaultRole ? `/dashboard/${defaultRole}` : acc.redirect;
      navigate(target);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Google SVG Logo */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Sign in with Google</h3>
              <p className="text-[10px] text-slate-400 font-medium">to continue to VIDYADAAN</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {signingIn ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <div>
              <p className="text-sm font-extrabold text-slate-900">Signing in with Google...</p>
              <p className="text-xs text-slate-500 mt-1">Connecting as {selectedAcc?.name}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500 font-medium text-center">
              Choose an account to sign in to VIDYADAAN:
            </p>

            {/* Account List */}
            <div className="space-y-2.5">
              {sampleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center gap-3 text-left group"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                    <span className="text-[9px] font-bold text-emerald-600">{acc.badge}</span>
                  </div>
                  <span className="text-slate-300 group-hover:text-blue-600 text-sm font-bold">→</span>
                </button>
              ))}
            </div>

            {/* Add account option */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() =>
                  handleSelectAccount({
                    name: "User Account",
                    email: "user@gmail.com",
                    redirect: defaultRole ? `/dashboard/${defaultRole}` : "/dashboard/donor",
                  })
                }
                className="w-full py-3 text-center text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <span>➕</span> Use another Google Account
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              To continue, Google will share your name, email address, and profile picture with VIDYADAAN.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleSignInModal;
