import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode = "login" }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isForgotting, setIsForgotting] = useState(false);
  const [searchParams] = useSearchParams();
  const { login, register, forgotPassword } = useAuth();
  const nav = useNavigate();
  const isLogin = mode === "login";

  const schema = useMemo(
    () =>
      z.object({
        name: isLogin ? z.string().optional() : z.string().min(2, "Name is required"),
        email: z.string().trim().email("Enter a valid email"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must include letters and numbers")
      }),
    [isLogin]
  );

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const submitAuth = async (data) => {
    try {
      if (isLogin) {
        await login(data.email, data.password);
        toast.success("Welcome back!");
      } else {
        await register({ ...data, role: "job_seeker" });
        toast.success("Account created successfully");
      }
      nav("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message
        || (err.request ? "Backend not reachable. Start backend + MongoDB." : "Authentication failed");
      toast.error(message);
    }
  };

  const triggerForgotPassword = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    try {
      setIsForgotting(true);
      const response = await forgotPassword(email);
      toast.success(response.message);
      if (response.previewUrl) {
        window.open(response.previewUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      const message = err.response?.data?.message
        || (err.request ? "Backend not reachable. Start backend + MongoDB." : "Failed to send reset link");
      toast.error(message);
    } finally {
      setIsForgotting(false);
    }
  };

  const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
  const oauthUrl = (provider) => `${apiBase}/auth/${provider}`;

  useEffect(() => {
    if (searchParams.get("oauthError")) {
      toast.error("OAuth sign-in failed. Please try again.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-auth-base">
      <div className="auth-arc-pattern" aria-hidden />
      <main className="relative z-10 px-5 py-8 md:px-10">
        <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
          <Link to="/login" className="font-semibold tracking-tight text-2xl">
            <span className="text-[#121629]">get.</span>
            <span className="bg-gradient-to-r from-[#5A54FF] to-[#6f54f6] bg-clip-text text-transparent">hired</span>
            <span className="text-[#8f84ff] align-top text-sm ms-1">+</span>
          </Link>
          <nav aria-label="Breadcrumb" className="text-sm text-[#3f3f69]">
            <Link to="/login" className="hover:text-[#26264c]">Home</Link>
            <span className="mx-2">/</span>
            <span className="font-medium">Log In</span>
          </nav>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="max-w-xl mx-auto rounded-[18px] border border-[#ecebff] bg-white/95 shadow-[0_20px_80px_rgba(80,66,181,0.12)] p-6 md:p-9"
        >
          <h1 className="text-4xl font-semibold text-center text-[#111225] tracking-tight">Welcome Back! 👋</h1>
          <p className="text-center text-[#6c6a84] mt-2 mb-6">Please log in below.</p>

          <div className="space-y-2">
            <a href={oauthUrl("google")} className="oauth-btn" aria-label="Continue with Google">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
              Log in with Google
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a href={oauthUrl("github")} className="oauth-btn text-sm" aria-label="Continue with GitHub">GitHub</a>
              <a href={oauthUrl("linkedin")} className="oauth-btn text-sm" aria-label="Continue with LinkedIn">LinkedIn</a>
            </div>
          </div>

          <div className="flex items-center gap-3 py-5 text-[#85849b] text-xs uppercase tracking-widest">
            <div className="h-px bg-[#e8e8f4] flex-1" />
            OR
            <div className="h-px bg-[#e8e8f4] flex-1" />
          </div>

          <form onSubmit={handleSubmit(submitAuth)} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="form-label">Full Name*</label>
                <input {...formRegister("name")} className="input-field" placeholder="Enter your full name" />
                {errors.name && <p className="input-error">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="form-label">Email Address*</label>
              <div className="relative">
                <Mail className="field-icon" />
                <input {...formRegister("email")} type="email" className="input-field input-icon-left" placeholder="Enter your email address" />
              </div>
              {errors.email && <p className="input-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Password*</label>
              <div className="relative">
                <Lock className="field-icon" />
                <input
                  {...formRegister("password")}
                  type={passwordVisible ? "text" : "password"}
                  className="input-field input-icon-left input-icon-right"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="field-action"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  onClick={() => setPasswordVisible((prev) => !prev)}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="input-error">{errors.password.message}</p>}
            </div>

            <button type="button" onClick={triggerForgotPassword} className="text-sm text-[#5f51dc] hover:text-[#4f41d0]" disabled={isForgotting}>
              {isForgotting ? "Sending reset link..." : "Forgot Password?"}
            </button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#37c66f] to-[#16a34a] text-white font-semibold disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Signing in..." : isLogin ? "Log In" : "Create account"}
            </motion.button>
          </form>

          <p className="text-xs text-center text-[#7a7b95] mt-4">
            By clicking Log In you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>

          <p className="text-center text-[#60627a] mt-5 text-sm">
            {isLogin ? "New to " : "Already have an account? "}
            <span className="font-semibold text-[#151729]">get.hired?</span>{" "}
            <Link className="text-[#5f51dc] font-semibold hover:text-[#4f41d0]" to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Join now!" : "Log in"}
            </Link>
          </p>
        </motion.section>
      </main>
    </div>
  );
}
