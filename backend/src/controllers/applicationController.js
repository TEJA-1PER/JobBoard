import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { computeJobMatch } from "../services/jobMatchService.js";
import { asyncHandler, AppError } from "../utils/error.js";

export const previewApplication = asyncHandler(async (req, res) => {
  const { jobId, resumeText = "", coverLetter = "" } = req.body;
  if (!jobId) throw new AppError("jobId is required", 400);
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);

  const score = computeJobMatch({ user: req.user, job, resumeTextOverride: resumeText });
  res.json({
    success: true,
    preview: {
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      coverLetterLength: coverLetter.length,
      matchScore: score.skillMatch,
      selectionProbability: score.selectionProbability,
      atsCompatibility: score.keywordMatch,
      missingSkills: score.missingSkills,
      recommendations: score.recommendations
    }
  });
});

export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId, coverLetter, resumeText = "" } = req.body;
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);
  const existing = await Application.findOne({ user: req.user._id, job: jobId });
  if (existing) throw new AppError("Already applied", 400);
  const score = computeJobMatch({ user: req.user, job, resumeTextOverride: resumeText });
  const app = await Application.create({
    user: req.user._id,
    job: jobId,
    coverLetter,
    timeline: [{ label: "Applied" }],
    aiScores: {
      totalScore: score.totalScore,
      skillMatch: score.skillMatch,
      experienceMatch: score.experienceMatch,
      selectionProbability: score.selectionProbability,
      growthScore: score.growthScore,
      atsCompatibility: score.keywordMatch,
      missingSkills: score.missingSkills
    }
  });
  job.applicantCount += 1;
  await job.save();
  res.status(201).json({ success: true, application: app });
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user._id }).populate("job");
  res.json({ success: true, applications });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) throw new AppError("Application not found", 404);
  if (req.user.role === "job_seeker" && app.user.toString() !== req.user._id.toString()) {
    throw new AppError("Forbidden", 403);
  }
  app.status = req.body.status;
  app.timeline.push({ label: `Status -> ${req.body.status}` });
  await app.save();
  res.json({ success: true, application: app });
});
