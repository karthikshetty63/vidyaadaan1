import { useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { FaLock, FaBell, FaShieldAlt, FaTrash } from "react-icons/fa";

/* Reusable toggle switch */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? "bg-blue-600" : "bg-gray-200"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

/* Reusable settings row */
const SettingRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
    <div className="flex-1 pr-6">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

const SchoolSettings = () => {
  /* Password form */
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });
  const handlePassSubmit = (e) => {
    e.preventDefault();
    alert("Password updated successfully.");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  /* Notification toggles */
  const [notifs, setNotifs] = useState({
    newDonation: true,
    ngoVerification: true,
    projectCompleted: true,
    weeklyReport: false,
    marketingEmails: false,
  });
  const toggleNotif = (key) => (val) => setNotifs({ ...notifs, [key]: val });

  /* Privacy toggles */
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showDonorNames: true,
    showProgress: true,
  });
  const togglePrivacy = (key) => (val) => setPrivacy({ ...privacy, [key]: val });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Change Password */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <FaLock className="text-blue-600 text-sm" />
          </div>
          <h2 className="font-bold text-slate-800">Change Password</h2>
        </div>
        <form onSubmit={handlePassSubmit} className="space-y-4">
          <Input
            label="Current Password"
            id="current"
            name="current"
            type="password"
            placeholder="Enter current password"
            value={passwords.current}
            onChange={handlePassChange}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              id="newPass"
              name="newPass"
              type="password"
              placeholder="Min. 8 characters"
              value={passwords.newPass}
              onChange={handlePassChange}
            />
            <Input
              label="Confirm New Password"
              id="confirm"
              name="confirm"
              type="password"
              placeholder="Repeat new password"
              value={passwords.confirm}
              onChange={handlePassChange}
            />
          </div>
          <Button type="submit" size="md">Update Password</Button>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <FaBell className="text-emerald-600 text-sm" />
          </div>
          <h2 className="font-bold text-slate-800">Notification Preferences</h2>
        </div>
        <div>
          <SettingRow
            label="New Donation Received"
            description="Get notified when a donor contributes to your project."
          >
            <Toggle checked={notifs.newDonation} onChange={toggleNotif("newDonation")} />
          </SettingRow>
          <SettingRow
            label="NGO Verification Updates"
            description="Alerts when an NGO reviews or verifies your issue."
          >
            <Toggle checked={notifs.ngoVerification} onChange={toggleNotif("ngoVerification")} />
          </SettingRow>
          <SettingRow
            label="Project Completed"
            description="Notification when a project is marked as completed."
          >
            <Toggle checked={notifs.projectCompleted} onChange={toggleNotif("projectCompleted")} />
          </SettingRow>
          <SettingRow
            label="Weekly Summary Report"
            description="Receive a weekly email summary of your school's activity."
          >
            <Toggle checked={notifs.weeklyReport} onChange={toggleNotif("weeklyReport")} />
          </SettingRow>
          <SettingRow
            label="Marketing Emails"
            description="Promotional updates and platform announcements."
          >
            <Toggle checked={notifs.marketingEmails} onChange={toggleNotif("marketingEmails")} />
          </SettingRow>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <FaShieldAlt className="text-blue-600 text-sm" />
          </div>
          <h2 className="font-bold text-slate-800">Privacy Settings</h2>
        </div>
        <div>
          <SettingRow
            label="Public School Profile"
            description="Allow donors to view your school's profile and projects."
          >
            <Toggle checked={privacy.publicProfile} onChange={togglePrivacy("publicProfile")} />
          </SettingRow>
          <SettingRow
            label="Show Donor Names"
            description="Display donor names on your project pages."
          >
            <Toggle checked={privacy.showDonorNames} onChange={togglePrivacy("showDonorNames")} />
          </SettingRow>
          <SettingRow
            label="Show Funding Progress"
            description="Show donation progress bars publicly on your issues."
          >
            <Toggle checked={privacy.showProgress} onChange={togglePrivacy("showProgress")} />
          </SettingRow>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <FaTrash className="text-red-500 text-sm" />
          </div>
          <h2 className="font-bold text-slate-800">Danger Zone</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Deleting your account is permanent and cannot be undone. All school data,
          issues, and donation records will be removed.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => alert("Please contact support to delete your account.")}
        >
          <FaTrash size={12} /> Delete Account
        </Button>
      </Card>
    </div>
  );
};

export default SchoolSettings;
