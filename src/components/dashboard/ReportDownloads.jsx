import { useState } from "react";
import { LuFileSpreadsheet, LuFileText } from "react-icons/lu";
import { downloadReportCsv, reportFileBase } from "../../utils/report";
import { downloadReportWord } from "../../utils/wordReport";
import Button from "../ui/Button";

/**
 * "Download CSV" and "Download Word" for a report card. `buildReport()` makes the report from the
 * dashboard's current records when a button is clicked; `kind` names the file (school, ngo, donor).
 */
const ReportDownloads = ({ kind, buildReport, disabled = false }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const downloadCsv = () => {
    setError("");
    downloadReportCsv(reportFileBase(kind), buildReport());
  };
  const downloadWord = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await downloadReportWord(reportFileBase(kind), buildReport());
    } catch {
      setError("The Word file couldn't be created. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" icon={LuFileSpreadsheet} onClick={downloadCsv} disabled={disabled}>Download CSV</Button>
        <Button variant="secondary" icon={LuFileText} onClick={downloadWord} loading={busy} disabled={disabled}>
          {busy ? "Preparing Word…" : "Download Word"}
        </Button>
      </div>
      {error && <p role="alert" className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
};

export default ReportDownloads;
