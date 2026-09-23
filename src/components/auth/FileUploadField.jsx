import { useId, useRef, useState } from "react";
import { LuFileText, LuUpload } from "react-icons/lu";
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
 * File picker with preview, change and remove.
 * Checks type and size before accepting the file; the server re-checks the real file content.
 */
const FileUploadField = ({ field, rule, file, onChange, error }) => {
  const inputRef = useRef(null);
  const hintId = useId();
  const [localError, setLocalError] = useState("");

  const handleSelect = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file after removing it
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
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-control border border-dashed bg-slate-50 text-left transition-colors hover:border-blue-400 hover:bg-blue-50/40 ${
            message ? "border-red-400" : "border-slate-300"
          }`}
        >
          <LuUpload className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="text-sm text-slate-600">
            <span className="font-medium text-blue-700">Choose file</span>
            <span className="text-slate-500"> — {rule.hint}</span>
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-control border border-slate-200 bg-white">
          {preview ? (
            <img src={preview} alt={`${rule.label} preview`} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
          ) : (
            <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <LuFileText className="w-5 h-5 text-slate-500" aria-hidden="true" />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{formatSize(file.size)} · ready to upload</p>
          </div>
          <button type="button" onClick={() => inputRef.current?.click()} className="px-2 py-1 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
            Change
          </button>
          <button type="button" onClick={handleRemove} className="px-2 py-1 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50">
            Remove
          </button>
        </div>
      )}

      <p id={hintId} className={`mt-1.5 text-xs ${message ? "font-medium text-red-600" : "text-slate-500"}`}>
        {message || "Maximum 5 MB."}
      </p>
    </div>
  );
};

export default FileUploadField;
