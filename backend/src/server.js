import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/env.js";
import { User } from "./models/User.js";
import { seedDemoJobs } from "./data/seedJobs.js";

const port = process.env.PORT || 5000;
validateEnv();

console.log("Environment validated. Starting server...");

connectDB()
  .then(() => {
    return User.findOne({ email: "recruiter@gethired.ai" }).then(async (existing) => {
      const recruiter = existing || (await User.create({
        name: "Default Recruiter",
        email: "recruiter@gethired.ai",
        password: "Recruiter@123",
        role: "recruiter"
      }));
      await seedDemoJobs(recruiter._id);
      app.listen(port, () => console.log(`Server running on ${port}`));
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
