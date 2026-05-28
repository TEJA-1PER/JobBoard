import { AppError } from "../utils/error.js";

export const notFound = (req, res, next) => next(new AppError(`Route not found: ${req.originalUrl}`, 404));

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    details: err.details || null,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
