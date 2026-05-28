import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hydrateFromToken } = useAuth();

  useEffect(() => {
    const complete = async () => {
      const token = searchParams.get("token");
      if (!token) {
        toast.error("OAuth token missing.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        await hydrateFromToken(token);
        toast.success("Logged in successfully");
        navigate("/dashboard", { replace: true });
      } catch (error) {
        toast.error(error.response?.data?.message || "OAuth login failed");
        navigate("/login", { replace: true });
      }
    };

    complete();
  }, [hydrateFromToken, navigate, searchParams]);

  return (
    <div className="min-h-screen grid place-items-center bg-auth-base">
      <p className="text-[#121629] font-medium">Completing OAuth sign-in...</p>
    </div>
  );
}
