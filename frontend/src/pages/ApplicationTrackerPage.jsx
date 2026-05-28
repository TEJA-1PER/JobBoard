import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";

const columns = ["applied", "under_review", "interview", "rejected", "selected"];

export default function ApplicationTrackerPage() {
  const { showToast } = useToast();
  const { data, refetch, isLoading, isError } = useQuery({ queryKey: ["applications"], queryFn: async () => (await api.get("/applications/me")).data });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/applications/${id}/status`, { status }),
    onSuccess: () => {
      showToast("Application status updated");
      refetch();
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to update application status", "error")
  });
  const grouped = columns.reduce((acc, c) => ({ ...acc, [c]: (data?.applications || []).filter((a) => a.status === c) }), {});
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Application Tracker</h1>
      {isLoading ? <div className="text-sm text-[#64748b]">Loading applications...</div> : null}
      {isError ? <div className="text-sm text-red-600">Unable to fetch application tracker.</div> : null}
      <div className="grid md:grid-cols-5 gap-3">
        {columns.map((c) => (
          <div key={c} className="glass rounded-xl p-3 min-h-44">
            <h3 className="font-semibold capitalize">{c.replace("_", " ")}</h3>
            <div className="space-y-2 mt-2">
              {!isLoading && !grouped[c]?.length ? <div className="text-xs text-[#64748b]">No applications</div> : null}
              {grouped[c]?.map((a) => (
                <div key={a._id} className="p-2 rounded border border-[#e2e8f0] bg-white text-sm space-y-2">
                  <div>{a.job?.title}</div>
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus.mutate({ id: a._id, status: e.target.value })}
                    className="w-full h-8 rounded border border-[#e2e8f0] text-xs px-2"
                  >
                    {columns.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
