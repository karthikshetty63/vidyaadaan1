import { useState } from "react";
import { LuCalendarPlus, LuFilePen } from "react-icons/lu";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import ChoiceChips from "../ui/ChoiceChips";
import FormField, { Input, Select, Textarea } from "../ui/FormField";
import Modal from "../ui/Modal";
import { EVENT_HELP_KINDS, EVENT_STATUSES, EVENT_TYPES, createSchoolEvent, updateSchoolEvent, validateEvent } from "../../api/events";

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = { title: "", type: "", date: "", venue: "", description: "", expectedStudents: "", helpNeeded: [], helpDetails: "" };
const fromEvent = (e) => ({
  title: e.title,
  type: e.type,
  date: e.date,
  venue: e.venue,
  description: e.description,
  expectedStudents: String(e.expectedStudents),
  helpNeeded: e.helpNeeded,
  helpDetails: e.helpDetails,
  status: e.status,
});
const same = (a, b) => (Array.isArray(a) ? a.length === b.length && a.every((v) => b.includes(v)) : a === b);

/**
 * Post an event, or edit one (pass `event`). Checks with the same rules as the server, shows the
 * server's per-field errors, and hands the saved event to onSaved(event, message).
 * An approved event's details are locked: only its date and status can change.
 */
const EventFormModal = ({ onClose, onSaved, event = null }) => {
  const isEdit = Boolean(event);
  const isResubmit = event?.reviewStatus === "REJECTED";
  const approved = event?.reviewStatus === "OPEN";
  const [form, setForm] = useState(() => (event ? fromEvent(event) : EMPTY));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    // An edit sends only what changed, so the server keeps everything else as it was.
    const original = isEdit ? fromEvent(event) : null;
    const payload = isEdit ? Object.fromEntries(Object.entries(form).filter(([key, value]) => !same(value, original[key]))) : form;
    if (isEdit && !Object.keys(payload).length) {
      if (!isResubmit) return onClose();
      setError("Make the changes the review team asked for, then resubmit.");
      return undefined;
    }
    const { errors: clientErrors } = validateEvent(payload, { isUpdate: isEdit });
    setErrors(clientErrors);
    setError("");
    if (Object.keys(clientErrors).length) return undefined;

    setSaving(true);
    try {
      const data = isEdit ? await updateSchoolEvent(event.id, payload) : await createSchoolEvent(payload);
      onSaved(data.event, data.message);
      onClose();
    } catch (saveError) {
      if (saveError.errors) setErrors(saveError.errors);
      setError(saveError.message || "Could not save the event. Please try again.");
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Modal
      open
      onClose={saving ? () => {} : onClose}
      size="lg"
      icon={isEdit ? LuFilePen : LuCalendarPlus}
      title={isResubmit ? "Edit and resubmit" : approved ? "Change date or status" : isEdit ? "Edit event" : "New school event"}
      description={
        approved
          ? event.title
          : isResubmit
            ? "Make the requested changes, then resubmit the event for review."
            : "Say what the event is and what help you'd like. The VIDYADAAN team reviews every event before NGOs and donors can see it."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="event-form" loading={saving}>
            {saving ? "Saving…" : isResubmit ? "Resubmit for review" : isEdit ? "Save changes" : "Send for review"}
          </Button>
        </>
      }
    >
      <form id="event-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {isResubmit && event.rejectionReason && <Alert tone="warning" title="Changes requested by the review team">{event.rejectionReason}</Alert>}
        {error && <Alert tone="danger">{error}</Alert>}

        {approved ? (
          <>
            <Alert tone="info">
              This event is approved, so its details are locked: NGOs and donors keep seeing what was reviewed. You can move its date or
              change its status. For anything else, cancel it and post a new event.
            </Alert>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Event date" required error={errors.date}>
                {(f) => <Input {...f} type="date" min={today()} value={form.date} onChange={set("date")} />}
              </FormField>
              <FormField label="Status" error={errors.status} hint="Completed and cancelled events take no more offers.">
                {(f) => (
                  <Select {...f} value={form.status} onChange={set("status")}>
                    {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                )}
              </FormField>
            </div>
          </>
        ) : (
          <>
            <FormField label="Event name" required error={errors.title}>
              {(f) => <Input {...f} value={form.title} onChange={set("title")} placeholder="e.g. Annual Sports Day 2026" maxLength={120} />}
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Type of event" required error={errors.type}>
                {(f) => (
                  <Select {...f} value={form.type} onChange={set("type")}>
                    <option value="">Select a type</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                )}
              </FormField>
              <FormField label="Event date" required error={errors.date}>
                {(f) => <Input {...f} type="date" min={today()} value={form.date} onChange={set("date")} />}
              </FormField>
              <FormField label="Students taking part" required error={errors.expectedStudents}>
                {(f) => <Input {...f} type="number" min="1" inputMode="numeric" value={form.expectedStudents} onChange={set("expectedStudents")} placeholder="300" />}
              </FormField>
            </div>
            <FormField label="Venue" error={errors.venue} hint="Optional. Where in or near the school it will be held.">
              {(f) => <Input {...f} value={form.venue} onChange={set("venue")} placeholder="e.g. School playground" maxLength={150} />}
            </FormField>
            <FormField label="About the event" required error={errors.description} hint="What will happen, and why it matters for the students. At least 20 characters.">
              {(f) => <Textarea {...f} rows={4} value={form.description} onChange={set("description")} maxLength={1500} placeholder="e.g. Track events, kabaddi and kho-kho for classes 1 to 7, with a prize for every class…" />}
            </FormField>
            <ChoiceChips label="What help would you like? *" options={EVENT_HELP_KINDS} value={form.helpNeeded} onChange={(helpNeeded) => setForm((f) => ({ ...f, helpNeeded }))} error={errors.helpNeeded} />
            <FormField label="Details of the help needed" error={errors.helpDetails} hint="Optional. For example how many volunteers, or which materials.">
              {(f) => <Textarea {...f} rows={2} value={form.helpDetails} onChange={set("helpDetails")} maxLength={500} placeholder="e.g. Ten volunteers to run the events, and 60 medals." />}
            </FormField>
            <Alert tone="neutral">
              No money moves through VIDYADAAN for events. NGOs and donors offer help; you accept or decline each offer and contact them yourself.
            </Alert>
          </>
        )}
      </form>
    </Modal>
  );
};

export default EventFormModal;
