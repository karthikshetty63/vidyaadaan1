import React, { useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";

const Settings = () => {
  const [profile, setProfile] = useState(INITIAL_SCHOOL_PROFILE);
  const [language, setLanguage] = useState("English");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout role="school" userName={profile.name} userSub={profile.district} title="School Portal Settings" subtitle={profile.name} notifications={[1, 2]}>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold mb-1 border border-slate-200">
              <span>⚙️</span> Portal Configuration
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">School Admin Account & Security Settings</h1>
            <p className="text-xs text-slate-500">Configure administrative credentials, principal info, password, notifications, and language.</p>
          </div>
          {saved && (
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-200 animate-pulse">
              ✓ Settings Saved Successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* School & Principal Info */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>🏫</span> School & Principal Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">UDISE Code</label>
                <input
                  type="text"
                  value={profile.udise}
                  onChange={(e) => setProfile({ ...profile, udise: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Principal Name</label>
                <input
                  type="text"
                  value={profile.principalName}
                  onChange={(e) => setProfile({ ...profile, principalName: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Language & Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>🌐</span> Portal Language
              </h2>
              <div className="space-y-2 text-xs">
                {["English", "Kannada (ಕನ್ನಡ)", "Hindi (हिंदी)", "Telugu (తెలుగు)", "Tamil (தமிழ்)"].map((lang) => (
                  <label key={lang} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors font-bold">
                    <input
                      type="radio"
                      name="language"
                      checked={language === lang.split(" ")[0]}
                      onChange={() => setLanguage(lang.split(" ")[0])}
                      className="accent-blue-600"
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>🔔</span> Alert Preferences & Security
              </h2>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <span className="font-bold text-slate-800">Email Notifications (NGO & Donor updates)</span>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <span className="font-bold text-slate-800">SMS Alerts for Direct Donations</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>

                <div className="pt-2">
                  <label className="block font-bold text-slate-700 mb-1">Change Account Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/25 transition-all"
            >
              💾 Save Configuration Settings
            </button>
          </div>

        </form>

      </main>
    </DashboardLayout>
  );
};

export default Settings;
