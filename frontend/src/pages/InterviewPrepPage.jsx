import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

const buildQuestions = (job) => {
  if (!job) return [];
  const skills = (job.requiredSkills || []).slice(0, 6);
  const technical = skills.map((skill) => `Explain a project where you used ${skill} and discuss trade-offs you handled.`);
  return [
    ...technical,
    `How would you prioritize features if you joined ${job.company} as a ${job.title}?`,
    "Describe a production incident you handled and what you improved afterward.",
    "Tell us about a conflict in a team and how you resolved it."
  ];
};

export default function InterviewPrepPage() {
  const [jobId, setJobId] = useState("");
  const jobs = useQuery({ queryKey: ["interview-jobs"], queryFn: async () => (await api.get("/jobs")).data.jobs });
  const selectedJob = useMemo(() => (jobs.data || []).find((job) => job._id === jobId), [jobs.data, jobId]);
  const questions = useMemo(() => buildQuestions(selectedJob), [selectedJob]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Interview Prep</h1>
      <div className="bg-white border border-[#eef1fb] rounded-2xl p-4">
        <label className="text-sm font-medium">Select target job</label>
        <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="mt-2 h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm w-full md:w-[460px]">
          <option value="">Choose a job for tailored questions</option>
          {(jobs.data || []).map((job) => <option key={job._id} value={job._id}>{job.title} - {job.company}</option>)}
        </select>
      </div>
      {selectedJob ? (
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-4">
          <h2 className="text-lg font-semibold">AI-tailored question set for {selectedJob.title}</h2>
          <ul className="mt-3 space-y-2">
            {questions.map((question) => <li key={question} className="text-sm rounded-lg border border-[#e2e8f0] p-3">{question}</li>)}
          </ul>
        </div>
      ) : (
        <div className="bg-white border border-[#eef1fb] rounded-2xl p-6 text-sm text-slate-600">Pick a job to generate role-specific interview questions.</div>
      )}
    </div>
  );
}
