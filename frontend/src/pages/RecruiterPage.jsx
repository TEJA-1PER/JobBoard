export default function RecruiterPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Recruiter Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-xl">Posted Jobs</div>
        <div className="glass p-4 rounded-xl">AI Candidate Matching</div>
        <div className="glass p-4 rounded-xl">Shortlisted Candidates</div>
      </div>
    </div>
  );
}
