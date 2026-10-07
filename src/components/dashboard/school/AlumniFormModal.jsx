import { useState } from "react";
import { LuGraduationCap } from "react-icons/lu";
import { addAlumni, updateAlumni, validateAlumni } from "../../../api/alumni";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import FormField, { Input } from "../../ui/FormField";
import Modal from "../../ui/Modal";

const fromAlum = (a) => ({
  name: a?.name || "",
  registerNumber: a?.registerNumber || "",
  email: a?.email || "",
  graduationYear: a?.graduationYear ? String(a.graduationYear) : "",
});

/**
 * Add an alum, or edit one (pass `alum`). Checks with the same rules as the server, which also
 * refuses a register number or email already on the school's list.
 */
const AlumniFormModal = ({ alum = null, onClose, onSaved }) => {
  const isEdit = Boolean(alum);
  const initial = fromAlum(alum);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    // An edit sends only what changed.
    const payload = isEdit ? Object.fromEntries(Object.entries(form).filter(([key, value]) => value !== initial[key])) : form;
    if (isEdit && !Object.keys(payload).length) return onClose();

    const { errors: clientErrors } = validateAlumni(payload, { isUpdate: isEdit });
    setErrors(clientErrors);
    setError("");
    if (Object.keys(clientErrors).length) return undefined;

    setSaving(true);
    try {
      const data = isEdit ? await updateAlumni(alum.id, payload) : await addAlumni(payload);
      onSaved(data.alum, data.message);
      onClose();
    } catch (saveError) {
      if (saveError.errors) setErrors(saveError.errors);
      else setError(saveError.message || "Could not save. Please try again.");
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Modal
      open
      onClose={saving ? () => {} : onClose}
      icon={LuGraduationCap}
      title={isEdit ? "Edit alumni details" : "Add alumni"}
      description={isEdit ? alum.name : "A former student of your school."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="alumni-form" loading={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Add alumni"}</Button>
        </>
      }
    >
      <form id="alumni-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}
        <FormField label="Full name" required error={errors.name}>
          {(f) => <Input {...f} value={form.name} onChange={set("name")} maxLength={100} autoComplete="off" data-autofocus />}
        </FormField>
        <FormField label="Register number" required error={errors.registerNumber} hint="As in your school's records. Each number can be added once.">
          {(f) => <Input {...f} value={form.registerNumber} onChange={set("registerNumber")} maxLength={40} autoComplete="off" placeholder="e.g. 2015/042" />}
        </FormField>
        <FormField label="Email address" required error={errors.email} hint="Used only to tell them when one of your projects is approved. Other alumni never see it.">
          {(f) => <Input {...f} type="email" inputMode="email" value={form.email} onChange={set("email")} maxLength={254} autoComplete="off" />}
        </FormField>
        <FormField label="Graduation year" error={errors.graduationYear} hint="Optional.">
          {(f) => (
            <Input
              {...f}
              inputMode="numeric"
              value={form.graduationYear}
              onChange={set("graduationYear")}
              maxLength={4}
              placeholder={String(new Date().getFullYear() - 5)}
              className="sm:max-w-40"
            />
          )}
        </FormField>
      </form>
    </Modal>
  );
};

export default AlumniFormModal;
