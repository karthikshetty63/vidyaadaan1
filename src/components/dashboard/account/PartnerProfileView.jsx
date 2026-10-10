import { useState } from "react";
import { LuCircleCheck, LuLock, LuPencil } from "react-icons/lu";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Card, { CardHeader } from "../../ui/Card";
import ChoiceChips from "../../ui/ChoiceChips";
import FormField, { Input, Select, Textarea } from "../../ui/FormField";
import Modal from "../../ui/Modal";
import PageHeader from "../../ui/PageHeader";
import { updateDonorProfile, updateNgoProfile } from "../../../api/profile";
import { useAuth } from "../../../context/AuthContext";
import { formatPhone } from "../../../utils/format";
import { DONOR_CAUSES, DONOR_FREQUENCIES, DONOR_STATES, NGO_FOCUS_AREAS, REGISTRATION_SCHEMAS, validateProfileUpdate } from "../../../../shared/registrationRules.js";

const day = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");
const list = (value) => (value?.length ? value.join(", ") : "");

// What each profile shows, and which of it the account may edit. The rest was verified by the
// VIDYADAAN team at registration, so it is locked (the server refuses changes to it too).
const CONFIG = {
  ngo: {
    save: updateNgoProfile,
    intro: "How schools and the VIDYADAAN team can reach your NGO, and what it does.",
    lockedNote: "Your NGO's name, registration details, PAN, district, state and email were verified when your account was approved. To change them, contact the VIDYADAAN team.",
    verified: (p) => [["NGO name", p.ngoName], ["Organisation type", p.type], ["Year established", p.established], ["Registration number", p.regNumber], ["Registration date", day(p.regDate)], ["PAN", p.pan], ["District", p.district], ["State", p.state], ["Official email", p.email]],
    details: (p) => [["Contact person", p.contactName], ["Phone", formatPhone(p.phone)], ["Alternate phone", p.altPhone ? formatPhone(p.altPhone) : ""], ["Website", p.website], ["Mission", p.mission], ["Focus areas", list(p.focus)], ["Registered address", p.address]],
    documents: [["registrationCertificate", "Registration certificate"], ["panCard", "PAN card"], ["certificate12A80G", "12A / 80G certificate"], ["annualReport", "Annual report"]],
    form: [
      { name: "contactName", kind: "text" },
      { name: "phone", kind: "text", hint: "A 10-digit Indian number." },
      { name: "altPhone", kind: "text", hint: "Optional." },
      { name: "website", kind: "text", hint: "Optional. Starts with https://" },
      { name: "mission", kind: "textarea", rows: 4 },
      { name: "focus", kind: "chips", options: NGO_FOCUS_AREAS },
      { name: "address", kind: "textarea", rows: 2 },
    ],
  },
  donor: {
    save: updateDonorProfile,
    intro: "Your contact details and giving preferences.",
    lockedNote: "Your name, email address, date of birth and PAN card were verified when your account was approved. To change them, contact the VIDYADAAN team.",
    verified: (p, user) => [["Name", user?.name], ["Email address", user?.email], ["Date of birth", day(p.dob)]],
    details: (p) => [["Phone", formatPhone(p.phone)], ["Address", p.address], ["City", p.city], ["State", p.state], ["PIN code", p.pin], ["Preferred causes", list(p.causes)], ["Donation frequency", p.frequency], ["Keep my donations anonymous", p.anonymous ? "Yes" : "No"]],
    documents: [["panCard", "PAN card"]],
    form: [
      { name: "phone", kind: "text", hint: "A 10-digit Indian number." },
      { name: "address", kind: "textarea", rows: 2 },
      { name: "city", kind: "text" },
      { name: "state", kind: "select", options: DONOR_STATES },
      { name: "pin", kind: "text", hint: "6 digits." },
      { name: "causes", kind: "chips", options: DONOR_CAUSES },
      { name: "frequency", kind: "select", options: DONOR_FREQUENCIES, optional: "No preference" },
      { name: "anonymous", kind: "checkbox", text: "Keep my donations anonymous" },
    ],
  },
};

const initialValue = (field, profile) => {
  const value = profile[field.name];
  if (field.kind === "chips") return value || [];
  if (field.kind === "checkbox") return value === true;
  return value ?? "";
};
const changed = (a, b) => (Array.isArray(a) ? JSON.stringify([...a].sort()) !== JSON.stringify([...b].sort()) : a !== b);

/** Edit the details an NGO or donor may change itself; sends only what changed. */
const ProfileFormModal = ({ role, profile, onClose, onSaved }) => {
  const config = CONFIG[role];
  const labels = REGISTRATION_SCHEMAS[role].fields;
  const initial = Object.fromEntries(config.form.map((field) => [field.name, initialValue(field, profile)]));
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const changes = Object.fromEntries(Object.entries(form).filter(([name, value]) => changed(value, initial[name])));
    if (!Object.keys(changes).length) return onClose();
    const { errors: clientErrors } = validateProfileUpdate(role, changes);
    setErrors(clientErrors);
    setError("");
    if (Object.keys(clientErrors).length) return undefined;

    setSaving(true);
    try {
      const data = await config.save(changes);
      onSaved(data.profile, changes);
      onClose();
    } catch (saveError) {
      if (saveError.errors) setErrors(saveError.errors);
      else setError(saveError.message || "Could not save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Modal
      open
      size="lg"
      icon={LuPencil}
      onClose={saving ? () => {} : onClose}
      title="Edit profile"
      description={config.intro}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="partner-profile-form" loading={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </>
      }
    >
      <form id="partner-profile-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}
        {config.form.map((field) => {
          const rule = labels[field.name];
          if (field.kind === "chips") {
            return <ChoiceChips key={field.name} label={rule.label} options={field.options} value={form[field.name]} onChange={(value) => set(field.name, value)} error={errors[field.name]} />;
          }
          if (field.kind === "checkbox") {
            return (
              <label key={field.name} className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface-line bg-surface-muted p-3.5 text-sm text-slate-700">
                <input type="checkbox" checked={form[field.name]} onChange={(e) => set(field.name, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600" />
                <span>
                  {field.text}
                  <span className="block text-xs text-slate-500">Schools never see who their donors are in any case.</span>
                </span>
              </label>
            );
          }
          return (
            <FormField key={field.name} label={rule.label} required={rule.required} hint={field.hint} error={errors[field.name]}>
              {(f) =>
                field.kind === "textarea" ? (
                  <Textarea {...f} rows={field.rows} value={form[field.name]} onChange={(e) => set(field.name, e.target.value)} />
                ) : field.kind === "select" ? (
                  <Select {...f} value={form[field.name]} onChange={(e) => set(field.name, e.target.value)}>
                    {field.optional && <option value="">{field.optional}</option>}
                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </Select>
                ) : (
                  <Input {...f} value={form[field.name]} onChange={(e) => set(field.name, e.target.value)} />
                )
              }
            </FormField>
          );
        })}
      </form>
    </Modal>
  );
};

const FactList = ({ rows }) => (
  <dl className="divide-y divide-surface-divider">
    {rows.map(([label, value]) => (
      <div key={label} className="grid grid-cols-1 gap-1 px-5 py-3 text-sm sm:grid-cols-3 sm:gap-4">
        <dt className="text-slate-500">{label}</dt>
        <dd className="whitespace-pre-line break-words font-medium text-slate-900 sm:col-span-2">{value === 0 || value ? value : "—"}</dd>
      </div>
    ))}
  </dl>
);

/**
 * An NGO's or donor's own profile: the details it can edit, the ones verified at registration (locked),
 * and which documents it uploaded. `role` is "ngo" or "donor".
 */
const PartnerProfileView = ({ role, profile, loading, error, onRetry, onSaved, notice }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const config = CONFIG[role];

  return (
    <>
      <PageHeader
        title="Profile"
        description={config.intro}
        actions={profile && <Button icon={LuPencil} onClick={() => setEditing(true)}>Edit profile</Button>}
      />
      {notice}
      {error && (
        <Alert tone="danger">
          {error} <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}
      {loading && <Card><p className="px-5 py-10 text-center text-sm text-slate-500" role="status">Loading your profile…</p></Card>}
      {!loading && !error && !profile && <Card><p className="px-5 py-10 text-center text-sm text-slate-500">Your profile couldn&rsquo;t be found. Please contact the VIDYADAAN team.</p></Card>}

      {profile && (
        <>
          <Card className="overflow-hidden">
            <CardHeader title="Your details" description="You can change these." actions={<Button size="sm" variant="secondary" icon={LuPencil} onClick={() => setEditing(true)}>Edit</Button>} />
            <FactList rows={config.details(profile)} />
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Verified at registration" description="Checked by the VIDYADAAN team." actions={<LuLock className="h-4 w-4 text-slate-400" aria-hidden="true" />} />
            <FactList rows={config.verified(profile, user)} />
            <p className="border-t border-surface-divider bg-surface-muted px-5 py-3 text-xs text-slate-600">{config.lockedNote}</p>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Documents" description="Only you and the VIDYADAAN team can open these." />
            <ul className="divide-y divide-surface-divider">
              {config.documents.map(([key, label]) => {
                const file = profile.documents?.[key];
                return (
                  <li key={key} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span className="text-slate-700">{label}</span>
                    {file ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700"><LuCircleCheck className="h-4 w-4" aria-hidden="true" /> Uploaded</span>
                    ) : (
                      <span className="text-slate-500">Not uploaded</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}

      {editing && profile && <ProfileFormModal role={role} profile={profile} onClose={() => setEditing(false)} onSaved={onSaved} />}
    </>
  );
};

export default PartnerProfileView;
