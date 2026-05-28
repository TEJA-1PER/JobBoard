import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";

const messageTypes = ["follow_up", "linkedin", "referral", "interview_follow_up", "cold_outreach", "thank_you"];

export default function RecruiterConnectPage() {
  const { showToast } = useToast();
  const [jobId, setJobId] = useState("");
  const [type, setType] = useState("follow_up");
  const jobs = useQuery({ queryKey: ["jobs-lite"], queryFn: async () => (await api.get("/jobs")).data.jobs });
  const messages = useQuery({ queryKey: ["messages"], queryFn: async () => (await api.get("/messages/me")).data.messages });
  const gen = useMutation({
    mutationFn: () => api.post("/messages/generate", { jobId, type }),
    onSuccess: () => {
      showToast("Recruiter message generated");
      messages.refetch();
    }
  });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Recruiter Connect AI</h1>
      <div className="glass p-4 rounded-xl flex flex-wrap gap-3">
        <select className="bg-white border border-[#e2e8f0] rounded p-2" onChange={(e) => setJobId(e.target.value)}>
          <option value="">Select Job</option>{(jobs.data || []).map((j) => <option value={j._id} key={j._id}>{j.title}</option>)}
        </select>
        <select className="bg-white border border-[#e2e8f0] rounded p-2" value={type} onChange={(e) => setType(e.target.value)}>{messageTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <button disabled={!jobId || gen.isPending} className="px-4 py-2 bg-[#4f46e5] text-white rounded disabled:opacity-60" onClick={() => gen.mutate()}>Generate Message</button>
      </div>
      <div className="space-y-2">{(messages.data || []).map((m) => <div className="glass p-3 rounded" key={m._id}><p className="text-xs text-slate-500">{m.type}</p><pre className="whitespace-pre-wrap text-sm">{m.content}</pre></div>)}</div>
    </div>
  );
}
