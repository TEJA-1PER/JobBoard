import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import JobCard from "../components/JobCard";
import { useToast } from "../context/ToastContext";
import { useState } from "react";
import ApplyFlowModal from "../components/ApplyFlowModal";

export default function RecommendationsPage() {
  const { showToast } = useToast();
  const [selectedJob, setSelectedJob] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const { data, refetch, isLoading, isError } = useQuery({ queryKey: ["recommendations"], queryFn: async () => (await api.get("/ai/recommendations")).data });
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
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">AI Recommendations</h1>
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-40 rounded-xl bg-white animate-pulse border border-[#eef1fb]" />)}</div>
      ) : isError ? (
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center text-red-600">Unable to load recommendations.</div>
      ) : (data?.recommendations || []).length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {(data?.recommendations || []).map((r) => (
            <JobCard
              key={r._id}
              job={r}
              onApply={setSelectedJob}
              onToggleSave={toggleSave.mutate}
              applyPending={apply.isPending || previewApply.isPending}
              savePending={toggleSave.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-8 text-center text-[#64748b]">
          {data?.message || "No recommendations yet. Upload your resume to improve matching quality."}
        </div>
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
