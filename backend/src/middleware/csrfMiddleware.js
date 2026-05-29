import crypto from "node:crypto";
import { AppError } from "../utils/error.js";

const cookieName = "csrfToken";
const CSRF_TTL_MS = 60 * 60 * 1000;

const csrfCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/"
};

const signCsrfPayload = (payload) =>
  crypto.createHmac("sha256", process.env.SESSION_SECRET || "csrf-fallback").update(payload).digest("hex");

export const createCsrfToken = () => {
  const raw = crypto.randomBytes(24).toString("hex");
  const issuedAt = Date.now().toString(36);
  const payload = `${raw}.${issuedAt}`;
  return `${payload}.${signCsrfPayload(payload)}`;
};

const isValidCsrfToken = (token) => {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [raw, issuedAt, signature] = parts;
  const payload = `${raw}.${issuedAt}`;
  if (signCsrfPayload(payload) !== signature) return false;
  const issuedMs = Number.parseInt(issuedAt, 36);
  if (!Number.isFinite(issuedMs) || Date.now() - issuedMs > CSRF_TTL_MS) return false;
  return true;
};

export const issueCsrfToken = (req, res) => {
  const token = createCsrfToken();
  res.cookie(cookieName, token, csrfCookieOptions);
  res.json({ success: true, csrfToken: token });
};

export const verifyCsrf = (req, res, next) => {
  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.[cookieName];

  if (cookieToken && headerToken && cookieToken === headerToken && isValidCsrfToken(headerToken)) {
    return next();
  }

  if (headerToken && isValidCsrfToken(headerToken)) {
    return next();
  }

  return next(new AppError("CSRF token validation failed", 403));
};
