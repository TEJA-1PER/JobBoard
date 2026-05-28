import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";

const templateType = "cold_outreach";

export default function CoverLettersPage() {
  const { showToast } = useToast();
  const [jobId, setJobId] = useState("");
  const jobs = useQuery({ queryKey: ["cover-jobs"], queryFn: async () => (await api.get("/jobs")).data.jobs });
  const messages = useQuery({ queryKey: ["cover-letters"], queryFn: async () => (await api.get("/messages/me")).data.messages });
  const generate = useMutation({
    mutationFn: () => api.post("/messages/generate", { jobId, type: templateType }),
    onSuccess: () => {
      showToast("Cover letter draft generated");
      messages.refetch();
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to generate letter", "error")
  });

  const letters = (messages.data || []).filter((message) => message.type === templateType);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Cover Letters</h1>
      <div className="bg-white border border-[#eef1fb] rounded-2xl p-4 flex flex-wrap gap-3">
        <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm min-w-64">
          <option value="">Select a job for targeted letter</option>
          {(jobs.data || []).map((job) => <option key={job._id} value={job._id}>{job.title} - {job.company}</option>)}
        </select>
        <button
          onClick={() => generate.mutate()}
          disabled={!jobId || generate.isPending}
          className="h-10 px-4 rounded-lg bg-[#4f46e5] text-white text-sm disabled:opacity-60"
        >
          {generate.isPending ? "Generating..." : "Generate Cover Letter"}
        </button>
      </div>
      <div className="space-y-3">
        {letters.length ? letters.map((item) => (
          <div key={item._id} className="bg-white border border-[#eef1fb] rounded-2xl p-4">
            <p className="text-xs text-slate-500">{item.job?.title} • {new Date(item.createdAt).toLocaleString()}</p>
            <pre className="whitespace-pre-wrap text-sm mt-2">{item.content}</pre>
          </div>
        )) : <div className="bg-white border border-[#eef1fb] rounded-2xl p-6 text-sm text-slate-600">No cover letter drafts yet.</div>}
      </div>
    </div>
  );
}
