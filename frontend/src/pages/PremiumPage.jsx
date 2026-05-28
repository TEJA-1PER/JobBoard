import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export default function PremiumPage() {
  const stats = useQuery({ queryKey: ["premium-dashboard"], queryFn: async () => (await api.get("/ai/dashboard")).data });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Premium Upgrade</h1>
      <div className="bg-white border border-[#eef1fb] rounded-2xl p-5">
        <p className="text-sm text-slate-600">
          Premium unlocks advanced ATS analysis, higher recommendation volume, and recruiter outreach automations.
        </p>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl border border-[#e2e8f0] p-3"><p className="text-xs text-slate-500">Current ATS</p><p className="font-semibold">{stats.data?.atsScore || 0}</p></div>
          <div className="rounded-xl border border-[#e2e8f0] p-3"><p className="text-xs text-slate-500">Top Matches</p><p className="font-semibold">{stats.data?.topMatches || 0}</p></div>
          <div className="rounded-xl border border-[#e2e8f0] p-3"><p className="text-xs text-slate-500">Applications</p><p className="font-semibold">{stats.data?.totalApplications || 0}</p></div>
        </div>
      </div>
    </div>
  );
}
