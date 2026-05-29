import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import passport, { configurePassport } from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

export const app = express();
app.use(helmet());
const allowedOrigins =
  process.env.CLIENT_URL?.split(",").map((url) => url.trim()).filter(Boolean) ||
  ["http://localhost:5174", "http://localhost:5175"];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/[\w.-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
configurePassport();
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status: dbConnected ? "ok" : "starting",
    db: dbConnected ? "connected" : "connecting"
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/messages", messageRoutes);
app.use(notFound);
app.use(errorHandler);
