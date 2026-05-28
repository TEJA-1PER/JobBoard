import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { Bookmark, BriefcaseBusiness, FileText, Mic, Sparkles, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const StatCard = ({ title, value, sub, accent = "purple", icon }) => (
  <div className="bg-white rounded-2xl border border-[#eef1fb] p-4 flex items-center justify-between">
    <div>
      <p className="text-sm text-[#64748b]">{title}</p>
      <h3 className="text-[32px] font-bold leading-none mt-1">{value}</h3>
      <p className="text-xs text-[#64748b] mt-2">{sub}</p>
    </div>
    <div className={`size-12 rounded-xl grid place-items-center ${accent === "green" ? "bg-[#ecfdf3] text-[#16a34a]" : accent === "orange" ? "bg-[#fff7ed] text-[#f97316]" : accent === "blue" ? "bg-[#eff6ff] text-[#3b82f6]" : "bg-[#eef0ff] text-[#4f46e5]"}`}>
      {icon}
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, isLoading: dashboardLoading, isError: dashboardError } = useQuery({ queryKey: ["dashboard"], queryFn: async () => (await api.get("/ai/dashboard")).data });
  const { data: ranked, refetch, isLoading: rankedLoading, isError: rankedError } = useQuery({ queryKey: ["ranked-jobs"], queryFn: async () => (await api.get("/jobs/ranked")).data });
  const { data: applications, isLoading: appLoading, isError: appError } = useQuery({ queryKey: ["dashboard-applications"], queryFn: async () => (await api.get("/applications/me")).data });
  const saveMutation = useMutation({
    mutationFn: (id) => api.post(`/jobs/${id}/save`),
    onSuccess: () => refetch(),
    onError: (err) => showToast(err.response?.data?.message || "Unable to save job", "error")
  });
  const jobs = (ranked?.jobs || []).slice(0, 3);
  const recentActivity = (applications?.applications || []).slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-bold">Welcome back, {user?.name || "Candidate"}! 👋</h1>
          <p className="text-[#64748b]">Here&apos;s your career overview for today.</p>
        </div>
        <button onClick={() => navigate("/recommendations")} className="h-9 px-4 rounded-xl bg-white border border-[#eef1fb] text-sm font-medium flex items-center gap-2">
          <Sparkles size={14} className="text-[#4f46e5]" /> AI Career Assistant <span className="size-2 rounded-full bg-green-500" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="ATS Score" value={data?.atsScore || 78} sub="↑ 8 pts this week" icon={<WandSparkles size={20} />} />
        <StatCard title="Top Job Matches" value={data?.topMatches || 24} sub="New matches today" accent="blue" icon={<BriefcaseBusiness size={20} />} />
        <StatCard title="Applications" value={data?.totalApplications || 12} sub="2 interviews this week" accent="green" icon={<FileText size={20} />} />
        <StatCard title="Profile Strength" value={`${data?.profileStrength || 85}%`} sub="Almost there!" accent="orange" icon={<Sparkles size={20} />} />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <section className="bg-white rounded-2xl border border-[#eef1fb]">
          <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">AI Recommended Jobs for You</h3>
              <p className="text-sm text-[#64748b]">Personalized job matches based on your skills and preferences.</p>
            </div>
            <Link to="/jobs" className="text-sm text-[#4f46e5] font-medium">View All →</Link>
          </div>
          <div>
            {rankedLoading ? <div className="p-5 text-sm text-[#64748b]">Loading recommendations...</div> : rankedError ? <div className="p-5 text-sm text-red-600">Could not load recommendations.</div> : null}
            {!rankedLoading && !rankedError && jobs.length === 0 ? <div className="p-5 text-sm text-[#64748b]">No recommended jobs yet. Upload your resume to improve matching.</div> : null}
            {jobs.map((job, i) => (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={job._id} className="px-5 py-4 border-b border-[#f1f5f9] flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="size-10 rounded-xl bg-[#eef0ff] grid place-items-center font-semibold text-[#4f46e5]">{(job.company || "C")[0]}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{job.title}</h4>
                      <span className="text-xs bg-[#e9f9ef] text-[#16a34a] px-2 py-0.5 rounded-full">{job.ai?.skillMatch || 90}% Match</span>
                    </div>
                    <p className="text-sm text-[#64748b] mt-0.5">{job.company} • {job.location} ({job.workMode})</p>
                    <div className="flex gap-2 text-xs text-[#475569] mt-2">
                      <span className="bg-[#f8fafc] px-2 py-1 rounded">₹{job.salaryMin || 18} - ₹{job.salaryMax || 30} LPA</span>
                      <span className="bg-[#f8fafc] px-2 py-1 rounded">{job.experienceMin || 2}-{job.experienceMax || 5} Yrs Exp</span>
                      {(job.requiredSkills || []).slice(0, 3).map((s) => <span key={s} className="bg-[#f8fafc] px-2 py-1 rounded">{s}</span>)}
                    </div>
                    <p className="text-xs text-[#64748b] mt-2">{job.ai?.why}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => saveMutation.mutate(job._id)} className="text-[#64748b] hover:text-[#0f172a]"><Bookmark size={16} /></button>
                  <span className="text-xs text-[#64748b]">{i + 2}h ago</span>
                </div>
              </motion.div>
            ))}
          </div>
          <Link to="/jobs" className="block py-4 text-center text-sm text-[#4f46e5] font-semibold">Explore More Jobs →</Link>
        </section>

        <section className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#eef1fb] p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your Career Activity</h3>
              <Link to="/tracker" className="text-sm text-[#4f46e5]">View All →</Link>
            </div>
            <ul className="mt-3 space-y-3 text-sm">
              {appLoading ? <li className="text-[#64748b]">Loading activity...</li> : null}
              {appError ? <li className="text-red-600">Unable to load activity.</li> : null}
              {recentActivity.length ? recentActivity.map((a) => (
                <li key={a._id}>{a.job?.title} • {a.status.replace("_", " ")}</li>
              )) : <li className="text-[#64748b]">No activity yet. Apply to jobs to see updates.</li>}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-[#eef1fb] p-4">
            <h3 className="font-semibold">AI Resume Insights</h3>
            <p className="text-sm mt-2">Good Score ({data?.atsScore || 78})</p>
            <ul className="text-sm mt-3 space-y-2">
              <li>✓ Add quantifiable achievements <span className="text-[#4f46e5]">High Impact</span></li>
              <li>✓ Include relevant keywords <span className="text-[#f97316]">Medium Impact</span></li>
              <li>✓ Improve project descriptions <span className="text-[#f97316]">Medium Impact</span></li>
            </ul>
            <Link to="/resume-editor" className="mt-4 inline-block text-sm text-[#4f46e5] font-semibold">Improve My Resume →</Link>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          ["AI Resume Tailor", "Tailor your resume to any job description", WandSparkles],
          ["Cover Letter Generator", "Generate personalized cover letters", FileText],
          ["Interview Prep", "Practice with AI mock interviews", Mic],
          ["Career Roadmap", "Get AI suggested career path", Sparkles]
        ].map(([title, sub, Icon]) => (
          <div key={title} className="bg-white rounded-2xl border border-[#eef1fb] p-4 flex items-start gap-3">
            <div className="size-9 rounded-xl bg-[#eef0ff] text-[#4f46e5] grid place-items-center"><Icon size={18} /></div>
            <div>
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-xs text-[#64748b] mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      {dashboardLoading ? <div className="text-sm text-[#64748b]">Loading dashboard insights...</div> : null}
      {dashboardError ? <div className="text-sm text-red-600">Unable to load dashboard insights right now.</div> : null}
    </div>
  );
}
