import { Link, useLocation } from "react-router-dom";

export default function LegalPage() {
  const { pathname } = useLocation();
  const isTerms = pathname === "/terms";

  return (
    <div className="min-h-screen bg-auth-base px-5 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-[#111225] mb-4">{isTerms ? "Terms of Service" : "Privacy Policy"}</h1>
        <p className="text-[#5c6078] leading-7">
          This is the official legal page for get.hired. Replace this content with your final legal text before launch.
          The page is intentionally routed and accessible so navigation from auth pages is fully functional.
        </p>
        <Link to="/login" className="inline-block mt-6 text-[#5348dd] font-semibold">Back to login</Link>
      </div>
    </div>
  );
}
