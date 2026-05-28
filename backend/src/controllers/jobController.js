import { Job } from "../models/Job.js";
import { SavedJob } from "../models/SavedJob.js";
import { asyncHandler } from "../utils/error.js";
import { computeJobMatch } from "../services/jobMatchService.js";

const timeMap = { "24h": 1, "3d": 3, "7d": 7 };

export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ success: true, job });
});

export const listJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    workMode,
    experience,
    companyType,
    postedWithin,
    education,
    minSalary,
    selectionChance,
    growth
  } = req.query;
  const q = {};
  if (search) q.$or = [{ title: { $regex: search, $options: "i" } }, { company: { $regex: search, $options: "i" } }];
  if (location) q.location = { $regex: location, $options: "i" };
  if (workMode) q.workMode = workMode;
  if (companyType) q.companyType = companyType;
  if (education) q.educationRequired = education;
  if (minSalary) q.salaryMax = { $gte: Number(minSalary) };
  if (experience) q.experienceMin = { $lte: Number(experience) };
  if (postedWithin && timeMap[postedWithin]) {
    const days = timeMap[postedWithin];
    q.postedAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  }
  let jobs = await Job.find(q).sort({ postedAt: -1 });
  if (selectionChance === "high") jobs = jobs.filter((j) => j.hiringUrgency >= 3 && j.applicantCount < 60);
  if (growth === "high") jobs = jobs.filter((j) => (j.growthSignals?.length || 0) >= 2);
  res.json({ success: true, jobs });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.json({ success: true, job });
});

export const getRankedJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    workMode,
    companyType,
    postedWithin,
    minExperience,
    maxExperience,
    savedOnly,
    sortBy = "best_match"
  } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { requiredSkills: { $regex: search, $options: "i" } }
    ];
  }
  if (location) query.location = { $regex: location, $options: "i" };
  if (workMode) query.workMode = workMode;
  if (companyType) query.companyType = companyType;
  if (postedWithin && timeMap[postedWithin]) {
    const days = timeMap[postedWithin];
    query.postedAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  }
  if (minExperience || maxExperience) {
    query.experienceMin = {};
    if (minExperience) query.experienceMin.$gte = Number(minExperience);
    if (maxExperience) query.experienceMin.$lte = Number(maxExperience);
  }

  const jobs = await Job.find(query).sort({ postedAt: -1 }).limit(200);
  const saved = await SavedJob.find({ user: req.user._id }).select("job");
  const savedSet = new Set(saved.map((s) => s.job.toString()));
  const ranked = jobs
    .map((job) => {
      const score = computeJobMatch({ user: req.user, job });
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
          recommendations: score.recommendations,
          why: `Strong overlap in required skills, ATS compatibility, and role experience alignment.`
        }
      };
    });

  const sortMap = {
    best_match: (a, b) => b.ai.totalScore - a.ai.totalScore,
    selection_probability: (a, b) => b.ai.selectionProbability - a.ai.selectionProbability,
    growth_potential: (a, b) => b.ai.growthScore - a.ai.growthScore,
    latest: (a, b) => new Date(b.postedAt) - new Date(a.postedAt),
    salary: (a, b) => (b.salaryMax || 0) - (a.salaryMax || 0)
  };
  ranked.sort(sortMap[sortBy] || sortMap.best_match);
  const filteredJobs = savedOnly === "true" ? ranked.filter((j) => j.saved) : ranked;
  res.json({ success: true, jobs: filteredJobs });
});

export const saveJob = asyncHandler(async (req, res) => {
  const saved = await SavedJob.findOneAndUpdate(
    { user: req.user._id, job: req.params.id },
    { user: req.user._id, job: req.params.id },
    { upsert: true, new: true }
  );
  res.status(201).json({ success: true, saved });
});

export const unsaveJob = asyncHandler(async (req, res) => {
  await SavedJob.findOneAndDelete({ user: req.user._id, job: req.params.id });
  res.json({ success: true });
});

export const listSavedJobs = asyncHandler(async (req, res) => {
  const items = await SavedJob.find({ user: req.user._id }).populate("job");
  res.json({ success: true, jobs: items.map((i) => i.job).filter(Boolean) });
});
