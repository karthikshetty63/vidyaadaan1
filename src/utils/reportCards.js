// The report card for each dashboard (school, NGO, donor), built from the same records the dashboard
// shows. utils/report.js turns any of them into a CSV, and utils/wordReport.js into a Word file.
import { projectStatusLabel } from "../api/projects";
import { partsLabel, partsOf } from "./format";
import { NGO_PAYMENT_STATUS, SCHOOL_PAYMENT_STATUS, paymentBadge } from "./payments";

const sum = (items, pick) => items.reduce((total, item) => total + (Number(pick(item)) || 0), 0);
const placeOf = (x) => [x?.district, x?.state].filter(Boolean).join(", ");
// "98765 01234": the 10-digit Indian number. A leading "+" would make spreadsheets show the CSV cell with an apostrophe.
const localPhone = (phone) => (/^\+91\d{10}$/.test(phone || "") ? `${phone.slice(3, 8)} ${phone.slice(8)}` : phone || "");
const howPaid = (pay) => (pay.channel === "ONLINE" ? "Online (Razorpay)" : pay.method);
const money = (label) => ({ label, type: "money" });
const number = (label) => ({ label, type: "number" });
const date = (label) => ({ label, type: "date" });
const text = (label) => ({ label });

/** School: its projects (review and funding) and the payments NGOs made for them. */
export const buildSchoolReport = ({ profile, user, projects, payments }) => {
  const approved = projects.filter((p) => p.reviewStatus === "OPEN");
  const accepted = payments.filter((p) => p.status === "ACCEPTED");
  return {
    title: "School report card",
    heading: profile?.schoolName || user?.name || "Your school",
    details: [placeOf(profile), profile?.udise ? `UDISE ${profile.udise}` : "", profile?.principalName ? `Principal: ${profile.principalName}` : ""].filter(Boolean),
    summary: [
      { label: "Projects", value: projects.length, type: "number" },
      { label: "Approved (open for funding)", value: approved.length, type: "number" },
      { label: "Waiting for review", value: projects.filter((p) => p.reviewStatus === "PENDING_REVIEW").length, type: "number" },
      { label: "Changes requested", value: projects.filter((p) => p.reviewStatus === "REJECTED").length, type: "number" },
      { label: "Budget requested (all projects)", value: sum(projects, (p) => p.budget), type: "money" },
      { label: "Funds raised (approved projects)", value: sum(approved, (p) => p.raised), type: "money" },
      { label: "Committed by NGOs", value: sum(projects, (p) => p.committed), type: "money" },
      { label: "NGO payments accepted", value: sum(accepted, (p) => p.amount), type: "money" },
      { label: "NGO payments waiting for your check", value: payments.filter((p) => p.status === "SUBMITTED").length, type: "number" },
      { label: "Students benefiting (approved projects)", value: sum(approved, (p) => p.studentsBenefited), type: "number" },
    ],
    sections: [
      {
        title: "Projects",
        description: "Every project your school has created, with its review or work status and its funding.",
        columns: [text("Project"), text("Category"), text("Priority"), text("Status"), money("Budget"), money("Raised"), money("Committed by NGOs"), number("Students"), date("Due"), date("Submitted"), text("Location"), text("Changes requested")],
        rows: projects.map((p) => [
          p.title, p.category, p.priority, projectStatusLabel(p), p.budget, p.raised, p.committed, p.studentsBenefited,
          p.expectedCompletion, p.submittedAt, p.location, p.reviewStatus === "REJECTED" ? p.rejectionReason : "",
        ]),
        empty: "No projects yet.",
      },
      {
        title: "Payments from NGOs",
        description: "Payments NGOs made for your projects: online through Razorpay, or directly to your bank account with proof.",
        columns: [date("Paid on"), text("NGO"), text("Project"), text("Parts"), money("Amount"), text("How"), text("Reference"), text("Status")],
        rows: payments.map((p) => [p.paidOn, p.ngo?.name, p.project.title, partsLabel(p.parts), p.amount, howPaid(p), p.reference, paymentBadge(p, SCHOOL_PAYMENT_STATUS)?.label || p.status]),
        empty: "No NGO payments yet.",
      },
    ],
    notes: [
      "Funds raised counts NGO payments your school accepted (or that were paid online) and donations confirmed by Razorpay. Donors' names are not shared with schools.",
      "Amounts are in Indian rupees. All figures come from VIDYADAAN's records at the time of download.",
    ],
  };
};

/** NGO: the needs it funds (its parts and where their money stands), its payments and its volunteers. */
export const buildNgoReport = ({ profile, user, funded, payments, volunteers }) => {
  const mine = (need) => need.parts.filter((p) => p.takenBy === "you");
  const amountWhere = (need, status) => sum(mine(need).filter((p) => p.status === status), (p) => p.amount);
  const parts = funded.flatMap(mine);
  return {
    title: "NGO report card",
    heading: profile?.ngoName || user?.name || "Your NGO",
    details: [placeOf(profile), profile?.regNumber ? `Registration no. ${profile.regNumber}` : "", user?.email ? `Account: ${user.email}` : ""].filter(Boolean),
    summary: [
      { label: "School needs funded", value: funded.length, type: "number" },
      { label: "Total committed", value: sum(parts, (p) => p.amount), type: "money" },
      { label: "Paid and confirmed", value: sum(parts.filter((p) => p.status === "RECEIVED"), (p) => p.amount), type: "money" },
      { label: "Paid, waiting for the school to confirm", value: sum(parts.filter((p) => p.status === "PAYMENT_SUBMITTED"), (p) => p.amount), type: "money" },
      { label: "Still to pay", value: sum(parts.filter((p) => p.status === "AWAITING_PAYMENT"), (p) => p.amount), type: "money" },
      { label: "Students supported", value: sum(funded, (n) => n.studentsBenefited), type: "number" },
      { label: "Payments recorded", value: payments.length, type: "number" },
      { label: "Volunteers", value: volunteers.length, type: "number" },
    ],
    sections: [
      {
        title: "School needs you fund",
        description: "Each need's budget is split into equal parts; these are the parts your NGO committed to.",
        columns: [text("Need"), text("School"), text("Place"), text("Category"), text("Your parts"), money("Committed"), money("Paid and confirmed"), money("Waiting for school"), money("Still to pay"), text("Need status"), number("Students")],
        rows: funded.map((n) => [
          n.title, n.school.name, placeOf(n.school), n.category, partsOf(mine(n).map((p) => p.part), n.parts.length),
          sum(mine(n), (p) => p.amount), amountWhere(n, "RECEIVED"), amountWhere(n, "PAYMENT_SUBMITTED"), amountWhere(n, "AWAITING_PAYMENT"), n.status, n.studentsBenefited,
        ]),
        empty: "No school needs funded yet.",
      },
      {
        title: "Payments",
        description: "Payments your NGO made, online through Razorpay or directly to the school's bank account.",
        columns: [date("Paid on"), text("Need"), text("School"), text("Parts"), money("Amount"), text("How"), text("Reference"), text("Status")],
        rows: payments.map((p) => [p.paidOn, p.project.title, p.school?.name, partsLabel(p.parts), p.amount, howPaid(p), p.reference, paymentBadge(p, NGO_PAYMENT_STATUS)?.label || p.status]),
        empty: "No payments yet.",
      },
      {
        title: "Volunteers",
        columns: [text("Name"), text("Role"), text("Phone"), text("Working on")],
        rows: volunteers.map((v) => [v.name, v.role, localPhone(v.phone), v.project?.title || "Not assigned"]),
        empty: "No volunteers yet.",
      },
    ],
    notes: ["Amounts are in Indian rupees. All figures come from VIDYADAAN's records at the time of download."],
  };
};

/** Donor: every confirmed donation, with the need and school it went to. */
export const buildDonorReport = ({ user, donations }) => {
  const byDate = [...donations].sort((a, b) => new Date(a.verifiedAt || a.createdAt) - new Date(b.verifiedAt || b.createdAt));
  const tests = donations.filter((d) => d.mode === "test").length;
  let testNote = "";
  if (tests && tests === donations.length) {
    testNote = `${donations.length === 1 ? "This donation was" : "All of these donations were"} made in Razorpay test mode: no real money was charged.`;
  } else if (tests) {
    testNote = `${tests} of these donations ${tests === 1 ? "was" : "were"} made in Razorpay test mode: no real money was charged for ${tests === 1 ? "it" : "them"}.`;
  }
  return {
    title: "Donor report card",
    heading: user?.name || "Your donations",
    details: [user?.email || ""].filter(Boolean),
    summary: [
      { label: "Total donated", value: sum(donations, (d) => d.amount), type: "money" },
      { label: "Donations", value: donations.length, type: "number" },
      { label: "School needs supported", value: new Set(donations.map((d) => d.project.id)).size, type: "number" },
      { label: "Schools supported", value: new Set(donations.map((d) => `${d.school.name}|${placeOf(d.school)}`)).size, type: "number" },
      { label: "First donation", value: byDate[0]?.verifiedAt || byDate[0]?.createdAt || "", type: "date" },
      { label: "Latest donation", value: byDate.at(-1)?.verifiedAt || byDate.at(-1)?.createdAt || "", type: "date" },
    ],
    sections: [
      {
        title: "Donations",
        description: "Each donation confirmed by Razorpay. Keep the payment ID as your reference.",
        columns: [date("Date"), text("School need"), text("School"), text("Place"), money("Amount"), text("Payment ID"), text("Payment mode"), text("Status")],
        rows: donations.map((d) => [d.verifiedAt || d.createdAt, d.project.title, d.school.name, placeOf(d.school), d.amount, d.paymentId, d.mode === "test" ? "Test mode" : "Live", "Confirmed"]),
        empty: "No donations yet.",
      },
    ],
    notes: [
      ...(testNote ? [testNote] : []),
      "Amounts are in Indian rupees. All figures come from VIDYADAAN's records at the time of download.",
    ],
  };
};
