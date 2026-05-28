import { User } from "../models/User.js";
import { AppError } from "../utils/error.js";
import { verifyJwt } from "../utils/tokens.js";

export const protect = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = headerToken || req.cookies?.accessToken || null;
    if (!token) return next(new AppError("Unauthorized", 401));
    const decoded = verifyJwt(token);
    if (decoded.type && decoded.type !== "access") return next(new AppError("Invalid token type", 401));
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new AppError("User not found", 404));
    req.user = user;
    next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new AppError("Forbidden", 403));
  next();
};
