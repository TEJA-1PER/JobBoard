import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ResumeEditorPage from "./pages/ResumeEditorPage";
import ApplicationTrackerPage from "./pages/ApplicationTrackerPage";
import RecruiterConnectPage from "./pages/RecruiterConnectPage";
import AdminPage from "./pages/AdminPage";
import RecruiterPage from "./pages/RecruiterPage";
import { useAuth } from "./context/AuthContext";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LegalPage from "./pages/LegalPage";
import AtsScorePage from "./pages/AtsScorePage";
import CoverLettersPage from "./pages/CoverLettersPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import CareerInsightsPage from "./pages/CareerInsightsPage";
import PremiumPage from "./pages/PremiumPage";

function HomeRoute() {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
