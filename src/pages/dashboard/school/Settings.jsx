import { useState } from "react";
import { LuCheck } from "react-icons/lu";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card, { CardHeader } from "../../../components/ui/Card";
import FormField, { Input } from "../../../components/ui/FormField";
import PageHeader from "../../../components/ui/PageHeader";
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

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <PageHeader
          title="Settings"
          description="Principal details, password, notifications and language."
          actions={saved && <span role="status"><Badge tone="success" icon={LuCheck}>Settings saved</Badge></span>}
        />

        <Alert tone="neutral">These settings are not yet saved to the server. Password changes are not available here yet.</Alert>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader title="School & principal" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5">
              <FormField label="School name">
                {(f) => <Input {...f} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />}
              </FormField>
              <FormField label="UDISE code">
                {(f) => <Input {...f} value={profile.udise} onChange={(e) => setProfile({ ...profile, udise: e.target.value })} />}
              </FormField>
              <FormField label="Principal name">
                {(f) => <Input {...f} value={profile.principalName} onChange={(e) => setProfile({ ...profile, principalName: e.target.value })} />}
              </FormField>
              <FormField label="Contact phone">
                {(f) => <Input {...f} type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />}
              </FormField>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Portal language" />
              <fieldset className="p-5">
                <legend className="sr-only">Portal language</legend>
                <div className="space-y-1">
                  {["English", "Kannada (ಕನ್ನಡ)", "Hindi (हिंदी)", "Telugu (తెలుగు)", "Tamil (தமிழ்)"].map((lang) => (
                    <label key={lang} className="flex items-center gap-3 px-3 h-10 rounded-lg cursor-pointer text-sm text-slate-700 hover:bg-slate-50">
                      <input
                        type="radio"
                        name="language"
                        checked={language === lang.split(" ")[0]}
                        onChange={() => setLanguage(lang.split(" ")[0])}
                        className="w-4 h-4 accent-blue-600"
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </fieldset>
            </Card>

            <Card>
              <CardHeader title="Notifications & security" />
              <div className="p-5 space-y-4">
                <label className="flex items-center justify-between gap-4 text-sm text-slate-700 cursor-pointer">
                  Email notifications (NGO &amp; donor updates)
                  <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                </label>
                <label className="flex items-center justify-between gap-4 text-sm text-slate-700 cursor-pointer">
                  SMS alerts for direct donations
                  <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                </label>
                <FormField label="New password" hint="Not saved yet — see the note above.">
                  {(f) => <Input {...f} type="password" autoComplete="new-password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} />}
                </FormField>
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save settings</Button>
          </div>
        </form>

        </div>
      </main>
    </DashboardLayout>
  );
};

export default Settings;
