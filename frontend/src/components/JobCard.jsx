import { motion } from "framer-motion";
import { MapPin, Building2, Bookmark } from "lucide-react";

export default function JobCard({ job, onApply, onToggleSave, applyPending = false, savePending = false }) {
  const ai = job.ai || {};
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-5 border border-[#eef1fb] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="text-sm text-[#64748b] flex items-center gap-2"><Building2 size={14} />{job.company}</p>
          <p className="text-sm text-[#64748b] flex items-center gap-2"><MapPin size={14} />{job.location}</p>
        </div>
        <div className="text-right text-xs space-y-1">
          <p className="font-medium text-[#16a34a]">Match {ai.skillMatch || 0}%</p>
          <p className="font-medium text-[#4f46e5]">Selection {ai.selectionProbability || 0}%</p>
          <p className="font-medium text-[#f97316]">Growth {ai.growthScore || 0}</p>
        </div>
      </div>
      <p className="text-sm text-[#64748b]">{ai.why || "Strong AI-ranked opportunity based on your profile."}</p>
      <div className="flex flex-wrap gap-2">{(ai.labels || []).map((l) => <span key={l} className="px-2 py-1 text-xs rounded-full bg-[#eef0ff] text-[#4f46e5]">{l}</span>)}</div>
      <div className="flex items-center gap-2">
        {onApply && (
          <button
            onClick={() => onApply(job)}
            disabled={applyPending || savePending}
            className="px-4 py-2 rounded-xl bg-[#4f46e5] text-white hover:bg-[#4338ca] disabled:opacity-60"
          >
            {applyPending ? "Processing..." : "One-Click Apply"}
          </button>
        )}
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(job)}
            disabled={savePending || applyPending}
            className="px-3 py-2 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] disabled:opacity-60"
          >
            <Bookmark size={16} className={job.saved ? "fill-[#4f46e5] text-[#4f46e5]" : "text-[#64748b]"} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
