import crypto from "node:crypto";
import Joi from "joi";
import nodemailer from "nodemailer";
import { User } from "../models/User.js";
import { asyncHandler, AppError } from "../utils/error.js";
import {
  buildRefreshCookieOptions,
  getRefreshExpiryDate,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyJwt
} from "../utils/tokens.js";

const frontendUrl = process.env.CLIENT_URL?.split(",")[0]?.trim() || "http://localhost:5174";

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .required()
    .messages({ "string.pattern.base": "Password must include letters and numbers" }),
  role: Joi.string().valid("job_seeker", "recruiter", "admin").default("job_seeker")
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(128).required()
});

const forgotSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

const resetSchema = Joi.object({
  token: Joi.string().length(64).required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .required()
    .messages({ "string.pattern.base": "Password must include letters and numbers" })
});

const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const buildAuthResponse = (user, accessToken) => ({
  success: true,
  token: accessToken,
  user: user.toSafeObject()
});

const issueSession = async (res, user) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpires = getRefreshExpiryDate();
  await user.save();
  res.cookie("refreshToken", refreshToken, buildRefreshCookieOptions());
  return buildAuthResponse(user, accessToken);
};

export const oauthSuccess = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new AppError("OAuth authentication failed", 401);
  console.log("[OAuth] Success for user:", user.email, "provider:", user.provider);
  const payload = await issueSession(res, user);
  console.log("[OAuth] JWT issued, redirecting to frontend");
  return res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(payload.token)}`);
});

export const oauthFailure = asyncHandler(async (req, res) => {
  console.warn("[OAuth] Failure redirect", { query: req.query });
  return res.redirect(`${frontendUrl}/login?oauthError=1`);
});

export const register = asyncHandler(async (req, res) => {
  const { value, error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError("Validation failed", 400, error.details.map((d) => d.message));

  const { name, email, password, role } = value;
  if (await User.findOne({ email })) throw new AppError("Email already exists", 400);
  const user = await User.create({ name, email, password, role, provider: "local", emailVerified: true });
  const payload = await issueSession(res, user);
  res.status(201).json(payload);
});

export const login = asyncHandler(async (req, res) => {
  const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError("Validation failed", 400, error.details.map((d) => d.message));

  const { email, password } = value;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) throw new AppError("Invalid credentials", 401);
  const payload = await issueSession(res, user);
  res.json(payload);
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new AppError("Refresh token missing", 401);

  const decoded = verifyJwt(refreshToken);
  if (decoded.type !== "refresh") throw new AppError("Invalid token type", 401);

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("User not found", 404);
  if (!user.refreshTokenHash || !user.refreshTokenExpires) throw new AppError("Session expired", 401);
  if (user.refreshTokenExpires <= new Date()) throw new AppError("Session expired", 401);
  if (user.refreshTokenHash !== hashToken(refreshToken)) throw new AppError("Session token mismatch", 401);

  const payload = await issueSession(res, user);
  res.json(payload);
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const decoded = verifyJwt(refreshToken);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokenHash = null;
        user.refreshTokenExpires = null;
        await user.save();
      }
    } catch {
      // Ignore invalid refresh token and still clear cookie.
    }
  }

  res.clearCookie("refreshToken", buildRefreshCookieOptions());
  res.json({ success: true, message: "Logged out" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { value, error } = forgotSchema.validate(req.body);
  if (error) throw new AppError("Validation failed", 400, error.details.map((d) => d.message));

  const user = await User.findOne({ email: value.email });
  if (!user) {
    return res.json({ success: true, message: "If an account exists, a reset link was sent." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  const transporter = await createTransporter();
  const mail = await transporter.sendMail({
    from: process.env.FROM_EMAIL || "no-reply@gethired.ai",
    to: user.email,
    subject: "Reset your get.hired password",
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 30 minutes.</p>`
  });

  const previewUrl = nodemailer.getTestMessageUrl(mail);
  res.json({
    success: true,
    message: "If an account exists, a reset link was sent.",
    previewUrl: previewUrl || undefined
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { value, error } = resetSchema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError("Validation failed", 400, error.details.map((d) => d.message));

  const hashedToken = crypto.createHash("sha256").update(value.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });
  if (!user) throw new AppError("Reset token is invalid or expired", 400);

  user.password = value.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ success: true, message: "Password reset successful. Please log in." });
});

export const me = asyncHandler(async (req, res) => res.json({ success: true, user: req.user.toSafeObject() }));
