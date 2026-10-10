import { useState } from "react";
import { LuCalendarDays, LuHandHelping, LuMapPin, LuSchool, LuUsers } from "react-icons/lu";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card, { CardHeader } from "../ui/Card";
import ChoiceChips from "../ui/ChoiceChips";
import ConfirmModal from "../ui/ConfirmModal";
import EmptyState from "../ui/EmptyState";
import FormField, { Textarea } from "../ui/FormField";
import Modal from "../ui/Modal";
import PageHeader from "../ui/PageHeader";
import { EVENT_HELP_KINDS, EVENT_OFFER_MESSAGE_MAX, offerEventHelp, validateEventOffer, withdrawEventOffer } from "../../api/events";
import { OFFER_STATES, formatEventDate, formatWhen, whenLabel } from "./eventFormat";

const schoolPlace = (school) => [school.district, school.state].filter(Boolean).join(", ");

/** Offer help for one event. Donors must agree that the school may see their name and email. */
const OfferHelpModal = ({ event, role, onClose, onOffered }) => {
  const [kinds, setKinds] = useState([]);
  const [message, setMessage] = useState("");
  const [shareContact, setShareContact] = useState(false);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ busy: false, error: "" });

  const submit = async (submitEvent) => {
    submitEvent.preventDefault();
    const offer = { kinds, message, ...(role === "donor" ? { shareContact } : {}) };
    const { errors: clientErrors } = validateEventOffer(offer, { role });
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;
    setState({ busy: true, error: "" });
    try {
      const data = await offerEventHelp(event.id, offer);
      // Waits until the list shows the new offer, so the card and the message change together.
      await onOffered(data.message);
      onClose();
    } catch (error) {
      if (error.errors) setErrors(error.errors);
      setState({ busy: false, error: error.message || "Could not send your offer. Please try again." });
    }
  };

  return (
    <Modal
      open
      size="lg"
      icon={LuHandHelping}
      onClose={state.busy ? () => {} : onClose}
      title="Offer help"
      description={`${event.title} · ${event.school.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={state.busy}>Cancel</Button>
          <Button type="submit" form="offer-form" loading={state.busy}>{state.busy ? "Sending…" : "Send offer"}</Button>
        </>
      }
    >
      <form id="offer-form" onSubmit={submit} noValidate className="space-y-5">
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        <p className="text-sm text-slate-600">
          The school asked for: <span className="font-medium text-slate-800">{event.helpNeeded.join(", ")}</span>.
          {event.helpDetails ? ` ${event.helpDetails}` : ""}
        </p>
        <ChoiceChips label="How can you help? *" options={EVENT_HELP_KINDS} value={kinds} onChange={setKinds} error={errors.kinds} />
        <FormField label="Message for the school" error={errors.message} hint="Optional. Say what you can bring or do, and when.">
          {(f) => <Textarea {...f} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={EVENT_OFFER_MESSAGE_MAX} placeholder="e.g. We can send eight volunteers for the whole day." />}
        </FormField>

        {role === "donor" ? (
          <div>
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm text-slate-700 ${errors.shareContact ? "border-red-300 bg-red-50/40" : "border-surface-line bg-surface-muted"}`}>
              <input type="checkbox" checked={shareContact} onChange={(e) => setShareContact(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600" />
              <span>I agree that this school may see my name and email address, so it can contact me about this event. (Schools never see who gives donations.)</span>
            </label>
            {errors.shareContact && <p className="mt-1.5 text-xs font-medium text-red-700">{errors.shareContact}</p>}
          </div>
        ) : (
          <Alert tone="neutral">The school will see your NGO&rsquo;s name, contact person, email and phone number, so it can reach you.</Alert>
        )}
        <Alert tone="neutral">
          An offer is a promise of help, not a payment: no money moves through VIDYADAAN for events. The school accepts or declines your offer,
          and contacts you if it accepts.
        </Alert>
      </form>
    </Modal>
  );
};

/** One upcoming event, with the viewer's own offer if they made one. */
const EventCard = ({ event, onOffer, onWithdraw }) => {
  const [expanded, setExpanded] = useState(false);
  const place = schoolPlace(event.school);
  const offer = event.myOffer;
  const long = event.description.length > 220;
  return (
    <article className="flex flex-col rounded-2xl border border-surface-line bg-surface shadow-card" aria-label={event.title}>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{event.type}</Badge>
          <Badge tone="info">{whenLabel(event.date)}</Badge>
        </div>
        <h3 className="mt-3 text-base font-bold leading-snug tracking-tight text-slate-900">{event.title}</h3>
        <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-slate-700">
          <LuSchool className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span>{event.school.name}{place && <span className="font-normal text-slate-500"> · {place}</span>}</span>
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5"><LuCalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" /> {formatEventDate(event.date)}</span>
          {event.venue && <span className="inline-flex items-center gap-1.5"><LuMapPin className="h-4 w-4 text-slate-400" aria-hidden="true" /> {event.venue}</span>}
          <span className="inline-flex items-center gap-1.5"><LuUsers className="h-4 w-4 text-slate-400" aria-hidden="true" /> {event.expectedStudents.toLocaleString("en-IN")} students</span>
        </p>
        <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 ${expanded ? "" : "line-clamp-3"}`}>{event.description}</p>
        {long && (
          <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="mt-1 self-start rounded text-xs font-semibold text-primary-700 hover:underline">
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="font-medium text-slate-700">Help wanted:</span>
          {event.helpNeeded.map((kind) => <Badge key={kind} tone="info">{kind}</Badge>)}
        </p>
        {event.helpDetails && <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600">{event.helpDetails}</p>}

        <div className="mt-auto pt-5">
          {offer ? (
            <div className="rounded-xl bg-surface-muted px-4 py-3">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                Your offer <Badge tone={OFFER_STATES[offer.status][0]}>{OFFER_STATES[offer.status][1]}</Badge>
              </p>
              <p className="mt-1 text-sm text-slate-600">{offer.kinds.join(", ")}</p>
              {offer.note && <p className="mt-1 text-sm text-slate-700">School&rsquo;s note: &ldquo;{offer.note}&rdquo;</p>}
              {offer.status === "OFFERED" && (
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => onWithdraw(event)} aria-label={`Withdraw your offer for ${event.title}`}>Withdraw offer</Button>
              )}
            </div>
          ) : (
            <Button icon={LuHandHelping} fullWidth onClick={() => onOffer(event)} aria-label={`Offer help for ${event.title}`}>Offer help</Button>
          )}
        </div>
      </div>
    </article>
  );
};

/**
 * School events for an NGO or a donor: the approved events still to come, and the account's own
 * offers of help with the schools' answers. `role` is "ngo" or "donor".
 */
const SupporterEvents = ({ role, open, mine, loading, error, onRetry, onChanged, notice }) => {
  const [offering, setOffering] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  // Offers on events that are no longer in the upcoming list (past, completed or cancelled).
  const openIds = new Set(open.map((e) => e.id));
  const earlier = mine.filter((e) => !openIds.has(e.id));

  return (
    <>
      <PageHeader
        title="School events"
        description="Events that schools would like help with. Offer what you can: the school accepts or declines your offer, and contacts you if it accepts. No money moves through VIDYADAAN for events."
      />
      {notice}
      {error && (
        <Alert tone="danger">
          {error} <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      <section aria-labelledby="upcoming-events-heading" className="space-y-4">
        <h2 id="upcoming-events-heading" className="text-[15px] font-bold tracking-tight text-slate-900">Upcoming events</h2>
        {loading && <Card><p className="px-5 py-10 text-center text-sm text-slate-500" role="status">Loading school events…</p></Card>}
        {!loading && !error && open.length === 0 && (
          <Card>
            <EmptyState icon={LuCalendarDays} title="No upcoming events right now" description="When the VIDYADAAN team approves a school's event, it appears here." />
          </Card>
        )}
        {open.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
            {open.map((event) => <EventCard key={event.id} event={event} onOffer={setOffering} onWithdraw={setWithdrawing} />)}
          </div>
        )}
      </section>

      {earlier.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader title="Your earlier offers" description="Events that are over, completed or cancelled." />
          <ul className="divide-y divide-surface-divider">
            {earlier.map((event) => (
              <li key={event.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{event.school.name} · {formatEventDate(event.date)}{event.status !== "Scheduled" ? ` · ${event.status}` : ""}</p>
                  <p className="mt-1 text-sm text-slate-600">You offered: {event.myOffer.kinds.join(", ")} · {formatWhen(event.myOffer.offeredAt)}</p>
                  {event.myOffer.note && <p className="mt-1 text-sm text-slate-700">School&rsquo;s note: &ldquo;{event.myOffer.note}&rdquo;</p>}
                </div>
                <Badge tone={OFFER_STATES[event.myOffer.status][0]}>{OFFER_STATES[event.myOffer.status][1]}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {offering && <OfferHelpModal event={offering} role={role} onClose={() => setOffering(null)} onOffered={onChanged} />}
      {withdrawing && (
        <ConfirmModal
          title="Withdraw your offer?"
          confirmLabel="Withdraw"
          busyLabel="Withdrawing…"
          onConfirm={async () => {
            const data = await withdrawEventOffer(withdrawing.id);
            await onChanged(data.message);
          }}
          onClose={() => setWithdrawing(null)}
        >
          <p>Your offer to help with &ldquo;{withdrawing.title}&rdquo; will be removed. You can offer again while the event is still open.</p>
        </ConfirmModal>
      )}
    </>
  );
};

export default SupporterEvents;
