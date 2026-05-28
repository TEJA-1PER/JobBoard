import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function ResumeEditorPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const { showToast } = useToast();
  const optimize = useMutation({
    mutationFn: () => api.post("/ai/resume/optimize", { resumeText, jobDescription }),
    onSuccess: (r) => {
      setOutput(r.data);
      showToast("Resume optimized successfully");
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to optimize resume", "error")
  });
  const [output, setOutput] = useState(null);
  const uploadResume = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("resume", file);
      return api.post("/ai/resume/upload", fd);
    },
    onSuccess: ({ data }) => {
      setResumeText(data.resumeText);
      showToast("Resume uploaded and parsed");
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to upload resume", "error")
  });

  const downloadOptimized = () => {
    if (!output?.optimizedText) return;
    const blob = new Blob([output.optimizedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">ATS Resume Optimizer</h1>
      <div className="bg-white rounded-xl border border-[#eef1fb] p-3">
        <input
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={(e) => e.target.files?.[0] && uploadResume.mutate(e.target.files[0])}
          className="text-sm"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea className="glass p-3 rounded min-h-72" placeholder="Paste resume" value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
        <textarea className="glass p-3 rounded min-h-72" placeholder="Paste job description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
      </div>
      <button
        onClick={() => {
          if (!resumeText.trim() || !jobDescription.trim()) {
            showToast("Resume and job description are required", "error");
            return;
          }
          optimize.mutate();
        }}
        disabled={optimize.isPending || uploadResume.isPending}
        className="px-5 py-2 bg-[#4f46e5] text-white rounded-xl disabled:opacity-60"
      >
        {optimize.isPending ? "Optimizing..." : "Optimize Resume"}
      </button>
      {uploadResume.isPending ? <p className="text-sm text-[#64748b]">Uploading and parsing resume...</p> : null}
      {optimize.isError ? <p className="text-sm text-red-600">Resume optimization failed. Please review inputs and retry.</p> : null}
      {output && (
        <div className="glass rounded-xl p-4 space-y-2">
          <p>ATS Score: <strong>{output.atsScore}</strong></p>
          {output.scoreBreakdown && (
            <p className="text-sm text-slate-600">
              Keyword: {output.scoreBreakdown.keywordMatchScore} | Formatting: {output.scoreBreakdown.formattingScore} | Skills: {output.scoreBreakdown.skillsCoverageScore}
            </p>
          )}
          <p>Missing Keywords: {output.missingKeywords.join(", ") || "None"}</p>
          <textarea className="w-full h-72 p-3 bg-black/30 rounded" value={output.optimizedText} readOnly />
          <button onClick={downloadOptimized} className="px-4 py-2 bg-[#4f46e5] text-white rounded-xl text-sm">Download Optimized Resume</button>
        </div>
      )}
    </div>
  );
}
