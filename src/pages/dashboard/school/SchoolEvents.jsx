import { useState } from "react";
import { LuCalendarDays, LuCalendarPlus, LuCheck, LuHandHelping, LuMail, LuMapPin, LuPencil, LuPhone, LuUsers, LuX } from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import EventFormModal from "../../../components/events/EventFormModal";
import { OFFER_STATES, eventState, formatEventDate, formatWhen, whenLabel } from "../../../components/events/eventFormat";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import FormField, { Textarea } from "../../../components/ui/FormField";
import Modal from "../../../components/ui/Modal";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";
import { EVENT_OFFER_NOTE_MAX, answerEventOffer } from "../../../api/events";
import { useAuth } from "../../../context/AuthContext";
import useSchoolEvents from "../../../hooks/useSchoolEvents";
import { formatPhone } from "../../../utils/format";

/** Accept or decline one offer, with an optional note the supporter will see. */
const AnswerOfferModal = ({ event, offer, decision, onClose, onAnswered }) => {
  const [note, setNote] = useState("");
  const [state, setState] = useState({ busy: false, error: "" });
  const accepting = decision === "ACCEPTED";

  const submit = async () => {
    setState({ busy: true, error: "" });
    try {
      const data = await answerEventOffer(event.id, offer.id, decision, note);
      onAnswered(data.event, data.message);
      onClose();
    } catch (error) {
      setState({ busy: false, error: error.message || "Could not save your answer. Please try again." });
    }
  };

  return (
    <Modal
      open
      size="sm"
      onClose={state.busy ? () => {} : onClose}
      title={accepting ? "Accept this offer?" : "Decline this offer?"}
      description={`${offer.supporter.name} · ${offer.kinds.join(", ")}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={state.busy}>Cancel</Button>
          <Button variant={accepting ? "primary" : "destructive"} onClick={submit} loading={state.busy}>
            {state.busy ? "Saving…" : accepting ? "Accept offer" : "Decline offer"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          {accepting
            ? "They'll see that you accepted. Contact them to arrange the details. Your answer can't be changed afterwards."
            : "They'll see that you declined. Your answer can't be changed afterwards."}
        </p>
        <FormField label="Note for them" hint={accepting ? "Optional. For example when to come, or who to ask for." : "Optional. A short reason helps."}>
          {(f) => <Textarea {...f} rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={EVENT_OFFER_NOTE_MAX} placeholder={accepting ? "e.g. Thank you! Please come to the office by 8 am." : "e.g. Thank you, we already have enough volunteers."} />}
        </FormField>
        {state.error && <Alert tone="danger">{state.error}</Alert>}
      </div>
    </Modal>
  );
};

/** One offer of help: who, what, and (while it's unanswered) Accept and Decline. */
const OfferRow = ({ offer, canAnswer, onAnswer }) => {
  const [tone, , label] = OFFER_STATES[offer.status];
  const { supporter } = offer;
  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
            {supporter.name}
            <Badge tone={offer.role === "ngo" ? "success" : "info"}>{offer.role === "ngo" ? "NGO" : "Donor"}</Badge>
            <Badge tone={tone}>{label}</Badge>
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <span className="font-medium">Offers:</span> {offer.kinds.join(", ")}
          </p>
          {offer.message && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">&ldquo;{offer.message}&rdquo;</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            {supporter.contactName && <span>Contact: {supporter.contactName}</span>}
            {supporter.email && (
              <a href={`mailto:${supporter.email}`} className="inline-flex items-center gap-1 font-medium text-primary-700 hover:underline">
                <LuMail className="h-3.5 w-3.5" aria-hidden="true" /> {supporter.email}
              </a>
            )}
            {supporter.phone && (
              <a href={`tel:${supporter.phone}`} className="inline-flex items-center gap-1 font-medium text-primary-700 hover:underline">
                <LuPhone className="h-3.5 w-3.5" aria-hidden="true" /> {formatPhone(supporter.phone)}
              </a>
            )}
            {supporter.place && <span>{supporter.place}</span>}
            <span>Offered {formatWhen(offer.offeredAt)}</span>
          </p>
          {offer.note && <p className="mt-2 text-xs text-slate-500">Your note: {offer.note}</p>}
        </div>
        {offer.status === "OFFERED" && canAnswer && (
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="secondary" icon={LuX} onClick={() => onAnswer(offer, "DECLINED")} aria-label={`Decline the offer from ${supporter.name}`}>Decline</Button>
            <Button size="sm" icon={LuCheck} onClick={() => onAnswer(offer, "ACCEPTED")} aria-label={`Accept the offer from ${supporter.name}`}>Accept</Button>
          </div>
        )}
      </div>
    </li>
  );
};

const EventCard = ({ event, onEdit, onAnswer }) => {
  const [tone, label] = eventState(event);
  const approved = event.reviewStatus === "OPEN";
  const waiting = event.offers.filter((o) => o.status === "OFFERED").length;
  return (
    <Card as="article" className="overflow-hidden" aria-label={event.title}>
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge>{event.type}</Badge>
              <Badge tone={tone}>{label}</Badge>
              {waiting > 0 && <Badge tone="warning">{waiting} to answer</Badge>}
            </div>
            <h2 className="mt-2 text-base font-bold tracking-tight text-slate-900">{event.title}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5"><LuCalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" /> {formatEventDate(event.date)} · {whenLabel(event.date)}</span>
              {event.venue && <span className="inline-flex items-center gap-1.5"><LuMapPin className="h-4 w-4 text-slate-400" aria-hidden="true" /> {event.venue}</span>}
              <span className="inline-flex items-center gap-1.5"><LuUsers className="h-4 w-4 text-slate-400" aria-hidden="true" /> {event.expectedStudents.toLocaleString("en-IN")} students</span>
            </p>
          </div>
          <Button size="sm" variant="secondary" icon={LuPencil} onClick={() => onEdit(event)} aria-label={`${approved ? "Change date or status of" : "Edit"} ${event.title}`}>
            {event.reviewStatus === "REJECTED" ? "Edit and resubmit" : approved ? "Date or status" : "Edit"}
          </Button>
        </div>

        {event.reviewStatus === "REJECTED" && event.rejectionReason && (
          <Alert tone="danger" title="Changes requested by the review team" className="mt-4">{event.rejectionReason}</Alert>
        )}
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{event.description}</p>
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Help wanted:</span>
          {event.helpNeeded.map((kind) => <Badge key={kind} tone="info">{kind}</Badge>)}
        </p>
        {event.helpDetails && <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600">{event.helpDetails}</p>}
      </div>

      <div className="border-t border-surface-line">
        <p className="flex items-center gap-2 bg-surface-muted px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600">
          <LuHandHelping className="h-4 w-4" aria-hidden="true" /> Offers of help ({event.offers.length})
        </p>
        {event.offers.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-500">
            {approved ? "No offers yet. NGOs and donors can see this event and offer help." : "NGOs and donors will be able to offer help once the VIDYADAAN team approves this event."}
          </p>
        ) : (
          <ul className="divide-y divide-surface-divider">
            {event.offers.map((offer) => <OfferRow key={offer.id} offer={offer} canAnswer={approved} onAnswer={(o, decision) => onAnswer(event, o, decision)} />)}
          </ul>
        )}
      </div>
    </Card>
  );
};

/** The school's events: post one, follow its review, and answer the offers of help it gets. */
const SchoolEvents = () => {
  const { user } = useAuth();
  const { events, loading, error, reload, upsert } = useSchoolEvents();
  const [form, setForm] = useState(null); // { event } — null event means a new one
  const [answering, setAnswering] = useState(null); // { event, offer, decision }
  const [notice, setNotice] = useState("");
  const saved = (event, message) => {
    upsert(event);
    setNotice(message);
  };

  const upcoming = events.filter((e) => eventState(e)[1] === "Approved").length;
  const inReview = events.filter((e) => e.reviewStatus === "PENDING_REVIEW").length;
  const toAnswer = events.reduce((count, e) => count + e.offers.filter((o) => o.status === "OFFERED").length, 0);
  const newEventButton = <Button icon={LuCalendarPlus} onClick={() => setForm({ event: null })}>New event</Button>;

  return (
    <DashboardLayout role="school" userName={user?.name} userSub={user?.email} title="School events" subtitle="Sports Day, Annual Day, fairs and drives">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            title="School events"
            description="Post an event, and NGOs and donors can offer help: volunteers, materials, prizes or sponsorship. You accept or decline each offer and contact them yourself."
            actions={newEventButton}
          />
          {notice && <Alert tone="success">{notice}</Alert>}
          {error && (
            <Alert tone="danger">
              {error} <button type="button" onClick={reload} className="font-medium underline underline-offset-2">Try again</button>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Approved and upcoming" value={loading ? "–" : upcoming} icon={LuCalendarDays} tone="emerald" />
            <StatCard label="Waiting for review" value={loading ? "–" : inReview} icon={LuCalendarPlus} tone="amber" />
            <StatCard label="Offers to answer" value={loading ? "–" : toAnswer} icon={LuHandHelping} tone={toAnswer ? "rose" : "slate"} />
          </div>

          {loading && <Card><p className="px-5 py-10 text-center text-sm text-slate-500" role="status">Loading your events…</p></Card>}
          {!loading && !error && events.length === 0 && (
            <Card>
              <EmptyState
                icon={LuCalendarDays}
                title="No events yet"
                description="Post your school's first event. The VIDYADAAN team reviews it, and then NGOs and donors can offer help. No money moves through VIDYADAAN for events."
                action={newEventButton}
              />
            </Card>
          )}
          {events.map((event) => (
            <EventCard key={event.id} event={event} onEdit={(e) => setForm({ event: e })} onAnswer={(e, offer, decision) => setAnswering({ event: e, offer, decision })} />
          ))}
        </div>
      </main>

      {form && <EventFormModal event={form.event} onClose={() => setForm(null)} onSaved={saved} />}
      {answering && <AnswerOfferModal {...answering} onClose={() => setAnswering(null)} onAnswered={saved} />}
    </DashboardLayout>
  );
};

export default SchoolEvents;
