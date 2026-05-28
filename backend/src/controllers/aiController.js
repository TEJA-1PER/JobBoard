import { Job } from "../models/Job.js";
import { Application } from "../models/Application.js";
import { ResumeVersion } from "../models/ResumeVersion.js";
import { SavedJob } from "../models/SavedJob.js";
import { extractSkillsFromResume, optimizeResumeForJob } from "../services/resumeService.js";
import { asyncHandler } from "../utils/error.js";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { computeJobMatch } from "../services/jobMatchService.js";

export const getRecommendations = asyncHandler(async (req, res) => {
  const jobs = await Job.find({}).limit(200);
  const user = req.user;
  const hasResumeSignal = Boolean((user.resumeText || "").trim()) || Boolean(user.profile?.skills?.length);
  if (!hasResumeSignal) {
    return res.json({
      success: true,
      recommendations: [],
      message: "Upload your resume and run ATS optimization to unlock AI recommendations."
    });
  }
  const saved = await SavedJob.find({ user: user._id }).select("job");
  const savedSet = new Set(saved.map((s) => s.job.toString()));
  const ranked = jobs.map((job) => {
    const score = computeJobMatch({ user, job });
    return {
      ...job.toObject(),
      saved: savedSet.has(job._id.toString()),
      ai: {
        totalScore: score.totalScore,
        skillMatch: score.skillMatch,
        experienceMatch: score.experienceMatch,
        keywordMatch: score.keywordMatch,
        selectionProbability: score.selectionProbability,
        growthScore: score.growthScore,
        missingSkills: score.missingSkills,
        labels: [
          score.selectionProbability > 75 ? "High Chance" : "Competitive",
          score.totalScore > 80 ? "Best Opportunity" : "Good Match"
        ],
        why: `Your profile matches ${score.skillMatch}% required skills with ${score.selectionProbability}% selection probability.`
      }
    };
  });
  ranked.sort((a, b) => b.ai.totalScore - a.ai.totalScore);
  res.json({ success: true, recommendations: ranked.slice(0, 50) });
});

export const optimizeResume = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  const result = optimizeResumeForJob(resumeText, jobDescription);
  req.user.resumeText = resumeText;
  req.user.atsScore = result.atsScore;
  await req.user.save();
  const version = await ResumeVersion.create({
    user: req.user._id,
    originalText: resumeText,
    optimizedText: result.optimizedText,
    targetJobDescription: jobDescription,
    atsScore: result.atsScore,
    missingKeywords: result.missingKeywords,
    extractedSkills: extractSkillsFromResume(resumeText)
  });
  res.json({ success: true, ...result, versionId: version._id });
});

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user._id });
  const stats = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const weeklyMatches = Math.max(2, Math.round((req.user.atsScore || 50) / 3.2));
  res.json({
    success: true,
    stats,
    totalApplications: applications.length,
    atsScore: req.user.atsScore || 0,
    topMatches: weeklyMatches,
    profileStrength: Math.min(98, Math.max(55, Math.round(((req.user.profile?.skills?.length || 1) * 7) + (req.user.atsScore || 0) * 0.4)))
  });
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Resume file is required" });

  let resumeText = "";
  if (req.file.mimetype === "application/pdf") {
    const parsed = await pdf(req.file.buffer);
    resumeText = parsed.text || "";
  } else if (
    req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    req.file.originalname.toLowerCase().endsWith(".docx")
  ) {
    const parsed = await mammoth.extractRawText({ buffer: req.file.buffer });
    resumeText = parsed.value || "";
  } else {
    resumeText = req.file.buffer.toString("utf-8");
  }

  const extractedSkills = extractSkillsFromResume(resumeText);
  req.user.resumeText = resumeText;
  req.user.profile = { ...req.user.profile, skills: [...new Set([...(req.user.profile?.skills || []), ...extractedSkills])] };
  await req.user.save();

  res.json({ success: true, resumeText, extractedSkills });
});

export const getResumeHistory = asyncHandler(async (req, res) => {
  const versions = await ResumeVersion.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("atsScore missingKeywords extractedSkills createdAt");
  res.json({ success: true, versions });
});
