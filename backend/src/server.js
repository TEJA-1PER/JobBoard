import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/env.js";
import { User } from "./models/User.js";
import { seedDemoJobs } from "./data/seedJobs.js";

const port = Number(process.env.PORT) || 5000;

const seedDemoData = async () => {
  const existing = await User.findOne({ email: "recruiter@gethired.ai" });
  const recruiter =
    existing ||
    (await User.create({
      name: "Default Recruiter",
      email: "recruiter@gethired.ai",
      password: "Recruiter@123",
      role: "recruiter"
    }));
  await seedDemoJobs(recruiter._id);
  console.log("[Seed] Demo recruiter and jobs ready");
};

const start = async () => {
  try {
    validateEnv();
    console.log("Environment validated. Starting server...");

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on port ${port}`);
    });

    connectDB()
      .then(() => seedDemoData())
      .catch((err) => {
        console.error("[DB] Startup connection failed:", err.message);
      });
  } catch (error) {
    console.error("Startup failed:", error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

start();
