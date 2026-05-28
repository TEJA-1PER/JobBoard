import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPinned,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AppLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");
  const links = [
    ["/dashboard", "Dashboard", LayoutDashboard],
    ["/jobs", "Job Search", Search],
    ["/recommendations", "AI Recommendations", Sparkles],
    ["/tracker", "Applications", ClipboardList],
    ["/resume-editor", "Resume Builder", FileText],
    ["/ats-score", "ATS Score", Star],
    ["/cover-letters", "Cover Letters", FileText],
    ["/interview-prep", "Interview Prep", Bot],
    ["/career-insights", "Career Insights", BriefcaseBusiness],
    ["/jobs?saved=true", "Saved Jobs", Star],
    ["/recruiter-connect", "Recruiter Connect", MessageSquareText]
  ];
  if (user?.role === "admin") links.push(["/admin", "Admin", LayoutDashboard]);
  if (user?.role === "recruiter") links.push(["/recruiter", "Recruiter", LayoutDashboard]);
  const isLinkActive = (to) => {
    const clean = to.split("?")[0];
    return location.pathname === clean && (!to.includes("?saved=true") || location.search.includes("saved=true"));
  };

  const onSearch = () => {
    const params = new URLSearchParams();
    if (searchText) params.set("search", searchText);
    if (locationText) params.set("location", locationText);
    navigate(`/jobs?${params.toString()}`);
  };

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#050816] text-[#e2e8f0]" : "bg-[#f8f9ff] text-[#0f172a]"}`}>
      <div className="grid grid-cols-[220px_1fr]">
        <aside className={`h-screen sticky top-0 px-4 py-5 flex flex-col ${theme === "dark" ? "bg-[#0b1226] border-r border-[#1e293b]" : "bg-white border-r border-[#eef1fb]"}`}>
          <h2 className="font-bold text-2xl px-2 pb-4">get<span className="text-[#4f46e5]">.hired</span><span className="text-[#f97316]">+</span></h2>
          <nav className="space-y-1">
            {links.map(([to, label, Icon]) => (
              <Link
                key={`${to}-${label}`}
                to={to}
                className={`flex items-center gap-3 text-[14px] px-3 py-2 rounded-xl ${
                  isLinkActive(to)
                    ? "bg-[#eef0ff] text-[#4f46e5] font-semibold"
                    : theme === "dark"
                      ? "text-[#cbd5e1] hover:bg-[#111827]"
                      : "text-[#334155] hover:bg-[#f4f6ff]"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-4">
            <div className={`rounded-2xl p-4 text-center ${theme === "dark" ? "bg-[#111827]" : "bg-[#eef0ff]"}`}>
              <p className="font-semibold text-[#1e293b]">Upgrade to Premium</p>
              <p className="text-xs text-[#64748b] mt-1">Unlock AI tools, top job matches and more.</p>
              <button onClick={() => navigate("/premium")} className="mt-3 w-full bg-[#4f46e5] text-white text-sm py-2 rounded-xl">Upgrade Now</button>
            </div>
            <div className="flex items-center gap-3 px-2">
              <div className="size-10 rounded-full bg-[#dbe2ff] grid place-items-center font-bold text-[#4f46e5]">{user?.name?.[0] || "U"}</div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{user?.name || "User"}</p>
                <button onClick={onLogout} className="text-xs text-[#64748b] hover:text-[#334155]">Logout</button>
              </div>
            </div>
          </div>
        </aside>

        <div className="px-7 py-4">
          <header className={`h-14 rounded-2xl px-4 flex items-center justify-between ${theme === "dark" ? "bg-[#0b1226] border border-[#1e293b]" : "bg-white border border-[#eceffd]"}`}>
            <div className="flex items-center w-[70%]">
              <div className={`flex-1 h-10 rounded-l-xl px-3 flex items-center gap-2 ${theme === "dark" ? "border border-[#1e293b] bg-[#111827]" : "border border-[#eef1fb] bg-[#fcfdff]"}`}>
                <Search size={16} className="text-[#94a3b8]" />
                <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search jobs, companies, or keywords" className="w-full bg-transparent outline-none text-sm" />
              </div>
              <div className={`w-56 h-10 px-3 flex items-center gap-2 ${theme === "dark" ? "border-y border-[#1e293b] bg-[#111827]" : "border-y border-[#eef1fb] bg-[#fcfdff]"}`}>
                <MapPinned size={16} className="text-[#94a3b8]" />
                <input value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="Hyderabad, Telangana" className="w-full bg-transparent outline-none text-sm" />
              </div>
              <button onClick={onSearch} className="h-10 px-5 rounded-r-xl bg-[#4f46e5] text-white text-sm font-medium">Search Jobs</button>
            </div>
            <div className="flex items-center gap-4 text-[#334155]">
              <button onClick={toggleTheme} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <div className="relative"><Bell size={18} /><span className="absolute -top-2 -right-2 size-4 rounded-full bg-red-500 text-white text-[10px] grid place-items-center">3</span></div>
              <div className="size-8 rounded-full bg-[#dbe2ff]" />
            </div>
          </header>
          <main className="pt-5"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}
