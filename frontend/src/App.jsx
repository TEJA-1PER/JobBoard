import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./context/AuthContext";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const ResumeEditorPage = lazy(() => import("./pages/ResumeEditorPage"));
const ApplicationTrackerPage = lazy(() => import("./pages/ApplicationTrackerPage"));
const RecruiterConnectPage = lazy(() => import("./pages/RecruiterConnectPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const RecruiterPage = lazy(() => import("./pages/RecruiterPage"));
const OAuthCallbackPage = lazy(() => import("./pages/OAuthCallbackPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const AtsScorePage = lazy(() => import("./pages/AtsScorePage"));
const CoverLettersPage = lazy(() => import("./pages/CoverLettersPage"));
const InterviewPrepPage = lazy(() => import("./pages/InterviewPrepPage"));
const CareerInsightsPage = lazy(() => import("./pages/CareerInsightsPage"));
const PremiumPage = lazy(() => import("./pages/PremiumPage"));

function PageLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-auth-base">
      <p className="text-[#121629] font-medium">Loading…</p>
    </div>
  );
}

function HomeRoute() {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/privacy" element={<LegalPage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="resume-editor" element={<ResumeEditorPage />} />
            <Route path="tracker" element={<ApplicationTrackerPage />} />
            <Route path="ats-score" element={<AtsScorePage />} />
            <Route path="cover-letters" element={<CoverLettersPage />} />
            <Route path="interview-prep" element={<InterviewPrepPage />} />
            <Route path="career-insights" element={<CareerInsightsPage />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="recruiter-connect" element={<RecruiterConnectPage />} />
            <Route path="admin" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
            <Route path="recruiter" element={<ProtectedRoute roles={["recruiter", "admin"]}><RecruiterPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
