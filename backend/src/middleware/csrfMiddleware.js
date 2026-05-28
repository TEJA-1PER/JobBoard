import crypto from "node:crypto";
import { AppError } from "../utils/error.js";

const cookieName = "csrfToken";

const csrfCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth"
};

export const issueCsrfToken = (req, res) => {
  const token = crypto.randomBytes(24).toString("hex");
  res.cookie(cookieName, token, csrfCookieOptions);
  res.json({ success: true, csrfToken: token });
};

export const verifyCsrf = (req, res, next) => {
  const cookieToken = req.cookies?.[cookieName];
  const headerToken = req.headers["x-csrf-token"];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError("CSRF token validation failed", 403));
  }
  return next();
};
