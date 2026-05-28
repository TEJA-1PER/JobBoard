import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import JobCard from "../components/JobCard";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";
import ApplyFlowModal from "../components/ApplyFlowModal";

export default function JobsPage() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({ search: "", location: "", workMode: "", postedWithin: "", companyType: "" });
  const [sortBy, setSortBy] = useState("best_match");
  const { showToast } = useToast();
  const savedOnly = params.get("saved") === "true";
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      search: params.get("search") || "",
      location: params.get("location") || ""
    }));
  }, [params]);
  const endpoint = "/jobs/ranked";
  const queryParams = useMemo(
    () =>
      new URLSearchParams({
        search: filters.search,
        location: filters.location,
        workMode: filters.workMode,
        postedWithin: filters.postedWithin,
        companyType: filters.companyType,
        savedOnly: savedOnly ? "true" : "false",
        sortBy
      }).toString(),
    [filters, savedOnly, sortBy]
  );
  const [selectedJob, setSelectedJob] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ["jobs", savedOnly, queryParams],
    queryFn: async () => (await api.get(`${endpoint}?${queryParams}`)).data
  });
  const previewApply = useMutation({
    mutationFn: (payload) => api.post("/applications/preview", payload),
    onSuccess: ({ data: payload }) => {
      setPreviewData(payload.preview);
      showToast("ATS analysis completed");
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to run ATS analysis", "error")
  });
  const apply = useMutation({
    mutationFn: (payload) => api.post("/applications", payload),
    onSuccess: () => {
      showToast("Application submitted");
      setSelectedJob(null);
      setPreviewData(null);
      refetch();
    },
    onError: (err) => showToast(err.response?.data?.message || "Unable to submit application", "error")
  });
  const toggleSave = useMutation({
    mutationFn: (job) => (job.saved ? api.delete(`/jobs/${job._id}/save`) : api.post(`/jobs/${job._id}/save`)),
    onSuccess: () => {
      showToast("Saved jobs updated");
      refetch();
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to update saved jobs", "error")
  });
  const jobsRaw = data?.jobs || [];
  const jobs = jobsRaw.filter((j) =>
    (!filters.search || `${j.title} ${j.company}`.toLowerCase().includes(filters.search.toLowerCase())) &&
    (!filters.location || (j.location || "").toLowerCase().includes(filters.location.toLowerCase())) &&
    (!filters.workMode || j.workMode === filters.workMode) &&
    (!filters.companyType || j.companyType === filters.companyType)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{savedOnly ? "Saved Jobs" : "Smart Jobs"}</h1>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 rounded-lg border border-[#eef1fb] px-3 text-sm bg-white">
          <option value="best_match">Best Match</option>
          <option value="selection_probability">Highest Selection Probability</option>
          <option value="growth_potential">Highest Growth Potential</option>
          <option value="salary">Highest Salary</option>
          <option value="latest">Latest Posted</option>
        </select>
      </div>
      <div className="bg-white border border-[#eef1fb] rounded-2xl p-3 grid md:grid-cols-5 gap-2">
        <input value={filters.search} className="h-10 rounded-lg border border-[#eef1fb] px-3 text-sm" placeholder="Keyword" onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        <input value={filters.location} className="h-10 rounded-lg border border-[#eef1fb] px-3 text-sm" placeholder="Location" onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} />
        <select value={filters.workMode} className="h-10 rounded-lg border border-[#eef1fb] px-3 text-sm" onChange={(e) => setFilters((f) => ({ ...f, workMode: e.target.value }))}>
          <option value="">All Modes</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">Onsite</option>
        </select>
        <select value={filters.postedWithin} className="h-10 rounded-lg border border-[#eef1fb] px-3 text-sm" onChange={(e) => setFilters((f) => ({ ...f, postedWithin: e.target.value }))}>
          <option value="">Any Time</option><option value="24h">Last 24h</option><option value="3d">Last 3 days</option><option value="7d">Last 7 days</option>
        </select>
        <select value={filters.companyType} className="h-10 rounded-lg border border-[#eef1fb] px-3 text-sm" onChange={(e) => setFilters((f) => ({ ...f, companyType: e.target.value }))}>
          <option value="">All Companies</option><option value="startup">Startup</option><option value="mnc">MNC</option><option value="product">Product</option><option value="service">Service</option>
        </select>
        <button onClick={refetch} className="h-10 bg-[#4f46e5] text-white rounded-lg text-sm">Search</button>
      </div>
      <div className="flex gap-2 text-sm">
        <button onClick={() => setParams({})} className={`px-3 py-1 rounded-lg border ${!savedOnly ? "bg-[#eef0ff] text-[#4f46e5]" : "bg-white"}`}>All Jobs</button>
        <button onClick={() => setParams({ saved: "true" })} className={`px-3 py-1 rounded-lg border ${savedOnly ? "bg-[#eef0ff] text-[#4f46e5]" : "bg-white"}`}>Saved Jobs</button>
      </div>
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-40 rounded-xl bg-white animate-pulse border border-[#eef1fb]" />)}</div>
      ) : isError ? (
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center text-red-600">Failed to load jobs. Please retry.</div>
      ) : jobs.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <JobCard
              key={j._id}
              job={j}
              onApply={setSelectedJob}
              onToggleSave={toggleSave.mutate}
              applyPending={apply.isPending || previewApply.isPending}
              savePending={toggleSave.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-8 text-center text-[#64748b]">No jobs found for selected filters.</div>
      )}
      <ApplyFlowModal
        open={Boolean(selectedJob)}
        job={selectedJob}
        preview={previewData}
        isPreviewLoading={previewApply.isPending}
        isSubmitLoading={apply.isPending}
        onClose={() => {
          setSelectedJob(null);
          setPreviewData(null);
        }}
        onPreview={previewApply.mutate}
        onSubmit={apply.mutate}
      />
    </div>
  );
}
