import { AppError } from "../utils/error.js";

const requiredVars = ["JWT_SECRET", "SESSION_SECRET", "CLIENT_URL"];

export const validateEnv = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    missing.push("MONGODB_URI|MONGO_URI");
  }
  if (missing.length) {
    throw new AppError(`Missing required environment variables: ${missing.join(", ")}`, 500);
  }
};
