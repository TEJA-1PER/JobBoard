export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Admin Panel</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-xl">Platform Analytics</div>
        <div className="glass p-4 rounded-xl">Recruiter Analytics</div>
        <div className="glass p-4 rounded-xl">System Insights</div>
      </div>
    </div>
  );
}
