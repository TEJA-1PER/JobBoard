import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export default function CareerInsightsPage() {
  const jobsQuery = useQuery({ queryKey: ["insights-jobs"], queryFn: async () => (await api.get("/jobs")).data.jobs });
  const jobs = jobsQuery.data || [];

  const insights = useMemo(() => {
    if (!jobs.length) return { avgSalary: 0, topSkills: [], remoteRatio: 0, topLocations: [] };
    const avgSalary = Math.round(jobs.reduce((sum, item) => sum + (item.salaryMax || item.salaryMin || 0), 0) / jobs.length);
    const skillsMap = new Map();
    const locationsMap = new Map();
    let remote = 0;
    jobs.forEach((job) => {
      if (job.workMode === "remote") remote += 1;
      (job.requiredSkills || []).forEach((skill) => skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1));
      locationsMap.set(job.location || "Unknown", (locationsMap.get(job.location || "Unknown") || 0) + 1);
    });
    const topSkills = [...skillsMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topLocations = [...locationsMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { avgSalary, topSkills, remoteRatio: Math.round((remote / jobs.length) * 100), topLocations };
  }, [jobs]);

  if (jobsQuery.isLoading) return <div className="text-sm text-slate-500">Loading market insights...</div>;
  if (jobsQuery.isError) return <div className="text-sm text-red-600">Unable to load market insights.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Career Insights</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-4"><p className="text-sm text-slate-500">Average Salary (Max)</p><p className="text-2xl font-bold mt-1">₹{insights.avgSalary} LPA</p></div>
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-4"><p className="text-sm text-slate-500">Remote Job Share</p><p className="text-2xl font-bold mt-1">{insights.remoteRatio}%</p></div>
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-4"><p className="text-sm text-slate-500">Openings Tracked</p><p className="text-2xl font-bold mt-1">{jobs.length}</p></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-4">
          <h2 className="text-lg font-semibold">Trending Skills</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {insights.topSkills.map(([skill, count]) => <li key={skill} className="flex justify-between rounded-lg border border-[#e2e8f0] px-3 py-2"><span>{skill}</span><span>{count} jobs</span></li>)}
          </ul>
        </div>
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-4">
          <h2 className="text-lg font-semibold">Top Locations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {insights.topLocations.map(([location, count]) => <li key={location} className="flex justify-between rounded-lg border border-[#e2e8f0] px-3 py-2"><span>{location}</span><span>{count} jobs</span></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
