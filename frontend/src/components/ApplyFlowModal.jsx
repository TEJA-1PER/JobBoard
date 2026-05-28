import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ApplyFlowModal({
  job,
  open,
  onClose,
  onPreview,
  onSubmit,
  isPreviewLoading,
  isSubmitLoading,
  preview
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    if (open) {
      setCoverLetter("");
      setResumeText("");
    }
  }, [open, job?._id]);

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 grid place-items-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#eef1fb] shadow-xl">
        <div className="px-5 py-4 border-b border-[#eef1fb] flex items-center justify-between">
          <h3 className="text-lg font-semibold">Apply to {job.title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <p className="text-sm text-slate-600 mb-2">Company: {job.company}</p>
            <label className="text-sm font-medium">Cover Letter (optional)</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="mt-1 w-full min-h-28 rounded-xl border border-[#e2e8f0] px-3 py-2 text-sm"
              placeholder="Add a concise cover note for this application"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Resume Text Override (optional)</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="mt-1 w-full min-h-36 rounded-xl border border-[#e2e8f0] px-3 py-2 text-sm"
              placeholder="Paste updated resume text to run ATS preview for this role"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPreview({ jobId: job._id, coverLetter, resumeText })}
              disabled={isPreviewLoading || isSubmitLoading}
              className="px-4 py-2 rounded-xl border border-[#dbe1f5] text-sm disabled:opacity-60"
            >
              {isPreviewLoading ? "Analyzing..." : "Run ATS Analysis"}
            </button>
            <button
              onClick={() => onSubmit({ jobId: job._id, coverLetter, resumeText })}
              disabled={isSubmitLoading || isPreviewLoading}
              className="px-4 py-2 rounded-xl bg-[#4f46e5] text-white text-sm disabled:opacity-60"
            >
              {isSubmitLoading ? "Submitting..." : "Confirm & Apply"}
            </button>
          </div>
          {preview && (
            <div className="rounded-xl border border-[#e2e8f0] p-4 space-y-2 bg-slate-50">
              <h4 className="font-semibold text-sm">ATS Preview</h4>
              <p className="text-sm">Match: <strong>{preview.matchScore}%</strong></p>
              <p className="text-sm">Selection Probability: <strong>{preview.selectionProbability}%</strong></p>
              <p className="text-sm">ATS Compatibility: <strong>{preview.atsCompatibility}%</strong></p>
              <p className="text-sm">Missing Skills: {preview.missingSkills?.length ? preview.missingSkills.join(", ") : "None"}</p>
              <ul className="text-xs text-slate-600 list-disc ps-4">
                {(preview.recommendations || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
