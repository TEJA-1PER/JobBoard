import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const token = searchParams.get("token");

  const schema = useMemo(
    () =>
      z
        .object({
          password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must include letters and numbers"),
          confirmPassword: z.string()
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"]
        }),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    if (!token) {
      toast.error("Reset token missing");
      return;
    }

    try {
      await resetPassword(token, password);
      toast.success("Password updated successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-auth-base">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg space-y-3">
        <h1 className="text-2xl font-semibold text-[#111225]">Reset Password</h1>
        <p className="text-sm text-[#666a83] mb-4">Set a new password for your get.hired account.</p>
        <input type="password" {...register("password")} className="input-field" placeholder="New password" />
        {errors.password && <p className="input-error">{errors.password.message}</p>}
        <input type="password" {...register("confirmPassword")} className="input-field" placeholder="Confirm password" />
        {errors.confirmPassword && <p className="input-error">{errors.confirmPassword.message}</p>}
        <button className="w-full h-11 rounded-full bg-[#20B052] text-white font-semibold disabled:opacity-60" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
