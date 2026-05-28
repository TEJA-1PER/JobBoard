import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    hrName: String,
    recruiterName: String,
    talentAcquisitionTeam: String,
    recruiterEmail: String,
    linkedinProfile: String,
    hiringManager: String,
    companyContactDetails: String
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    workMode: { type: String, enum: ["remote", "hybrid", "onsite"], default: "onsite", index: true },
    experienceMin: { type: Number, default: 0, index: true },
    experienceMax: { type: Number, default: 2 },
    educationRequired: { type: String, default: "Any Degree" },
    salaryMin: Number,
    salaryMax: Number,
    requiredSkills: [{ type: String, index: true }],
    preferredSkills: [String],
    companyType: { type: String, enum: ["startup", "mnc", "product", "service"], default: "startup" },
    companyRating: { type: Number, default: 3.5 },
    hiringUrgency: { type: Number, default: 3 },
    applicantCount: { type: Number, default: 0 },
    growthSignals: [String],
    recruiter: recruiterSchema,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
