import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const ACCESS_TTL = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export const signAccessToken = (id) => jwt.sign({ id, type: "access" }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });

export const signRefreshToken = (id) =>
  jwt.sign({ id, type: "refresh", nonce: crypto.randomUUID() }, process.env.JWT_SECRET, { expiresIn: "30d" });

export const verifyJwt = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const getRefreshExpiryDate = () => new Date(Date.now() + REFRESH_TTL_MS);

export const buildRefreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: REFRESH_TTL_MS,
    path: "/api/auth"
  };
};
