import { useId, useRef, useState } from "react";
import { LuCircleCheck, LuFileText, LuUpload } from "react-icons/lu";
import { getUploadError } from "../../../shared/registrationRules.js";

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

// One object URL per selected image, reused across re-renders and step changes
// (so the thumbnail survives leaving and returning to the Documents step).
const previewUrls = new WeakMap();
const previewFor = (file) => {
  if (!file || !file.type?.startsWith("image/")) return null;
  if (!previewUrls.has(file)) previewUrls.set(file, URL.createObjectURL(file));
  return previewUrls.get(file);
};
const releasePreview = (file) => {
  const url = file && previewUrls.get(file);
  if (url) {
    URL.revokeObjectURL(url);
    previewUrls.delete(file);
  }
};

/**
 * File picker (click, or drag a file onto it) with preview, change and remove.
 * Checks type and size before accepting the file; the server re-checks the real file content.
 */
const FileUploadField = ({ field, rule, file, onChange, error }) => {
  const inputRef = useRef(null);
  const hintId = useId();
  const [localError, setLocalError] = useState("");
  const [dragging, setDragging] = useState(false);

  const accept = (selected) => {
    if (!selected) return;
    const problem = getUploadError(rule, selected);
    if (problem) {
      setLocalError(problem);
      return;
    }
    setLocalError("");
    releasePreview(file);
    onChange(selected);
  };

  const handleSelect = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file after removing it
    accept(selected);
  };

  // Dropping a file works like choosing it (and is checked the same way).
  const dropProps = {
    onDragOver: (event) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event) => {
      event.preventDefault();
      setDragging(false);
      accept(event.dataTransfer.files?.[0]);
    },
  };

  const handleRemove = () => {
    setLocalError("");
    releasePreview(file);
    onChange(null);
  };

  const preview = previewFor(file);
  const message = localError || error;

  return (
    <div>
      <label htmlFor={`upload-${field}`} className="block text-sm font-medium text-slate-700 mb-1.5">
        {rule.label}
        {rule.required ? <span className="text-red-600" aria-hidden="true"> *</span> : <span className="font-normal text-slate-500"> (optional)</span>}
      </label>
      <input
        ref={inputRef}
        id={`upload-${field}`}
        type="file"
        accept={rule.types.join(",")}
        onChange={handleSelect}
        className="sr-only"
        aria-invalid={Boolean(message) || undefined}
        aria-describedby={hintId}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          {...dropProps}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 border-dashed text-left transition-colors ${
            dragging ? "border-blue-500 bg-blue-50" : message ? "border-red-300 bg-red-50/40" : "border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/40"
          }`}
        >
          <span className="w-11 h-11 rounded-xl bg-white text-blue-600 shadow-sm flex items-center justify-center shrink-0" aria-hidden="true">
            <LuUpload className="w-5 h-5" />
          </span>
          <span className="text-sm text-slate-600">
            <span className="block font-semibold text-slate-800">{dragging ? "Drop the file here" : <><span className="text-blue-700">Choose a file</span> or drag it here</>}</span>
            <span className="block text-xs text-slate-500">{rule.hint}</span>
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/40" {...dropProps}>
          {preview ? (
            <img src={preview} alt={`${rule.label} preview`} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
          ) : (
            <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <LuFileText className="w-5 h-5 text-slate-500" aria-hidden="true" />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
            <p className="flex items-center gap-1 text-xs text-emerald-700">
              <LuCircleCheck className="h-3.5 w-3.5" aria-hidden="true" /> {formatSize(file.size)} · ready to upload
            </p>
          </div>
          <button type="button" onClick={() => inputRef.current?.click()} className="px-2 py-1 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
            Change
          </button>
          <button type="button" onClick={handleRemove} className="px-2 py-1 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50">
            Remove
          </button>
        </div>
      )}

      {/* The picker already shows the hint; screen readers get it here, and everyone sees errors. */}
      <p id={hintId} className={message ? "mt-1.5 text-xs font-medium text-red-600" : "sr-only"}>
        {message || rule.hint}
      </p>
    </div>
  );
};

export default FileUploadField;
