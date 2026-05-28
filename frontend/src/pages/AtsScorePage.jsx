import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function AtsScorePage() {
  const dashboard = useQuery({ queryKey: ["ats-dashboard"], queryFn: async () => (await api.get("/ai/dashboard")).data });
  const history = useQuery({ queryKey: ["resume-history"], queryFn: async () => (await api.get("/ai/resume/history")).data });

  if (dashboard.isLoading || history.isLoading) return <div className="text-sm text-slate-500">Loading ATS analytics...</div>;
  if (dashboard.isError || history.isError) return <div className="text-sm text-red-600">Unable to load ATS analytics.</div>;

  const versions = history.data?.versions || [];
  const atsScore = dashboard.data?.atsScore || 0;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">ATS Score</h1>
      <div className="bg-white border border-[#eef1fb] rounded-2xl p-5">
        <p className="text-sm text-slate-500">Current ATS Score</p>
        <p className="text-4xl font-bold">{atsScore}</p>
        <p className="text-sm text-slate-600 mt-2">Your ATS score updates whenever you optimize your resume against a job description.</p>
        <Link to="/resume-editor" className="inline-block mt-4 text-sm text-[#4f46e5] font-semibold">Open Resume Builder →</Link>
      </div>
      <div className="bg-white border border-[#eef1fb] rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-3">Recent ATS Reports</h2>
        {versions.length ? (
          <div className="space-y-2">
            {versions.map((item) => (
              <div key={item._id} className="rounded-xl border border-[#e2e8f0] p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Score: {item.atsScore}</p>
                  <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Missing Keywords: {item.missingKeywords?.length ? item.missingKeywords.slice(0, 8).join(", ") : "None"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No ATS reports yet. Optimize your resume to generate one.</p>
        )}
      </div>
    </div>
  );
}
