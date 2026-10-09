// The report card (utils/report.js) as a Word document (.docx). The "docx" package is loaded only when
// someone clicks "Download Word", so it never slows down the dashboards.
import { downloadBlob } from "./csv";
import { displayValue, generatedOn, isNumeric } from "./report";

const INK = "0F172A";
const MUTED = "64748B";
const BRAND = "4F46E5";
const HEADER_FILL = "E0E7FF";
const LINE = "CBD5E1";

/** Build the .docx for `report` and save it as `${fileBase}.docx`. */
export const downloadReportWord = async (fileBase, report, date = new Date()) => {
  const { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, PageOrientation, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } =
    await import("docx");

  const text = (value, options = {}) => new TextRun({ text: String(value), color: INK, ...options });
  const para = (children, options = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], ...options });
  const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
  const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

  const cell = (value, { header = false, right = false, bold = false } = {}) =>
    new TableCell({
      children: [para(text(value, { bold: header || bold, size: 18 }), { alignment: right ? AlignmentType.RIGHT : AlignmentType.LEFT })],
      shading: header ? { type: ShadingType.CLEAR, color: "auto", fill: HEADER_FILL } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
    });

  const table = (columns, rows) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders,
      rows: [
        new TableRow({ tableHeader: true, children: columns.map((c) => cell(c.label, { header: true, right: isNumeric(c.type) })) }),
        ...rows.map((row) => new TableRow({ children: row.map((value, i) => cell(displayValue(value, columns[i].type), { right: isNumeric(columns[i].type) })) })),
      ],
    });

  const summaryTable = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    borders,
    rows: report.summary.map(
      (s) => new TableRow({ children: [cell(s.label), cell(displayValue(s.value, s.type), { right: isNumeric(s.type), bold: true })] })
    ),
  });

  const space = () => para(text(""), { spacing: { after: 120 } });
  const children = [
    para(text("VIDYADAAN", { bold: true, color: BRAND, size: 20 }), { spacing: { after: 60 } }),
    para(text(report.title, { bold: true, size: 36 }), { heading: HeadingLevel.TITLE, spacing: { after: 120 } }),
    para(text(report.heading, { bold: true, size: 28 }), { spacing: { after: 60 } }),
    ...(report.details || []).map((d) => para(text(d, { color: MUTED, size: 20 }))),
    para(text(`Generated on ${generatedOn(date)}`, { color: MUTED, size: 18, italics: true }), { spacing: { after: 240 } }),
    para(text("Summary", { bold: true, size: 26 }), { heading: HeadingLevel.HEADING_2, spacing: { after: 120 } }),
    summaryTable,
  ];

  for (const section of report.sections) {
    children.push(space(), para(text(section.title, { bold: true, size: 26 }), { heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
    if (section.description) children.push(para(text(section.description, { color: MUTED, size: 18 }), { spacing: { after: 120 } }));
    children.push(section.rows.length ? table(section.columns, section.rows) : para(text(section.empty, { color: MUTED, size: 20, italics: true })));
  }
  if (report.notes?.length) {
    children.push(space());
    for (const note of report.notes) children.push(para(text(note, { color: MUTED, size: 16 }), { spacing: { after: 60 } }));
  }

  const doc = new Document({
    creator: "VIDYADAAN",
    title: `${report.title}: ${report.heading}`,
    styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
    sections: [
      {
        // Landscape, so wide tables fit on the page.
        properties: { page: { size: { orientation: PageOrientation.LANDSCAPE }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });
  downloadBlob(await Packer.toBlob(doc), `${fileBase}.docx`);
};
