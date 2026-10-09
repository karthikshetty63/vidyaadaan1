// A "report card": one description of a report that becomes both the CSV and the Word file, so the two
// always contain the same figures. Every value comes from the dashboard's real records.
//
// report = {
//   title:    "School report card",
//   heading:  who it is about ("Govt. Higher Primary School, Kadiyali"),
//   details:  short lines under the heading ["Udupi, Karnataka", …],
//   summary:  [{ label, value, type }],
//   sections: [{ title, description?, columns: [{ label, type }], rows: [[value, …]], empty: "No … yet." }],
//   notes:    ["…"],
// }
// type: "text" (default) | "money" (whole rupees) | "number" | "date" (YYYY-MM-DD or a timestamp)
import { downloadCsv } from "./csv";
import { formatINR } from "./format";

const pad = (n) => String(n).padStart(2, "0");
const toDate = (value) => (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value));

/** "2026-10-09" (the local calendar day). */
const isoDay = (value) => {
  const d = toDate(value);
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const isEmpty = (value) => value === null || value === undefined || value === "";

/** How a value reads in the Word file and on screen: "₹1,25,000", "1,240", "9 Oct 2026". */
export const displayValue = (value, type = "text") => {
  if (isEmpty(value)) return "—";
  if (type === "money") return formatINR(value);
  if (type === "number") return Number(value).toLocaleString("en-IN");
  if (type === "date") {
    const d = toDate(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  return String(value);
};

/** How a value goes into the CSV: plain numbers (so spreadsheets can add them up) and YYYY-MM-DD dates. */
const csvValue = (value, type = "text") => {
  if (isEmpty(value)) return "";
  if (type === "money" || type === "number") return Number(value);
  if (type === "date") return isoDay(value);
  return String(value);
};

export const isNumeric = (type) => type === "money" || type === "number";

/** "9 October 2026, 10:15 am" */
export const generatedOn = (date = new Date()) =>
  `${date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}, ${date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;

/** "vidyadaan-school-report-2026-10-09" (the extension is added per file type). */
export const reportFileBase = (kind, date = new Date()) => `vidyadaan-${kind}-report-${isoDay(date)}`;

/** The report as CSV rows: a title block, the summary, then each section with its own header row. */
export const reportToCsvRows = (report, date = new Date()) => {
  const rows = [[`VIDYADAAN ${report.title}`], [report.heading], ...(report.details || []).map((d) => [d]), [`Generated on ${generatedOn(date)}`], []];
  rows.push(["Summary"], ...report.summary.map((s) => [s.label, csvValue(s.value, s.type)]), []);
  for (const section of report.sections) {
    rows.push([section.title]);
    if (section.description) rows.push([section.description]);
    rows.push(section.columns.map((c) => c.label));
    if (section.rows.length) rows.push(...section.rows.map((row) => row.map((value, i) => csvValue(value, section.columns[i].type))));
    else rows.push([section.empty]);
    rows.push([]);
  }
  for (const note of report.notes || []) rows.push([note]);
  return rows;
};

export const downloadReportCsv = (fileBase, report) => downloadCsv(`${fileBase}.csv`, reportToCsvRows(report));
