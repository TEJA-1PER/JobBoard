import mongoose from "mongoose";

const resumeVersionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    originalText: String,
    optimizedText: String,
    targetJobDescription: String,
    atsScore: Number,
    missingKeywords: [String],
    extractedSkills: [String]
  },
  { timestamps: true }
);

export const ResumeVersion = mongoose.model("ResumeVersion", resumeVersionSchema);
