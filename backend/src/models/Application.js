import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
    status: {
      type: String,
      enum: ["applied", "under_review", "interview", "rejected", "selected"],
      default: "applied",
      index: true
    },
    coverLetter: String,
    notes: String,
    aiScores: {
      totalScore: Number,
      skillMatch: Number,
      experienceMatch: Number,
      selectionProbability: Number,
      growthScore: Number,
      atsCompatibility: Number,
      missingSkills: [String]
    },
    timeline: [{ label: String, date: { type: Date, default: Date.now } }]
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);
