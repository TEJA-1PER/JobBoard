const normalize = (s) => s.trim().toLowerCase();

export const extractKeywords = (text = "") =>
  [...new Set((text.toLowerCase().match(/[a-zA-Z+#.]{3,}/g) || []).filter((k) => k.length > 3))];

export const scoreSkillMatch = (candidateSkills = [], requiredSkills = [], preferredSkills = []) => {
  const c = new Set(candidateSkills.map(normalize));
  const req = requiredSkills.map(normalize);
  const pref = preferredSkills.map(normalize);
  const reqMatched = req.filter((s) => c.has(s)).length;
  const prefMatched = pref.filter((s) => c.has(s)).length;
  const reqScore = req.length ? (reqMatched / req.length) * 100 : 100;
  const prefScore = pref.length ? (prefMatched / pref.length) * 100 : 100;
  return Math.round(reqScore * 0.8 + prefScore * 0.2);
};

export const scoreExperienceMatch = (years, min, max) => {
  if (years < min) return Math.max(0, Math.round((years / Math.max(1, min)) * 100));
  if (years > max) return 90;
  return 100;
};

export const scoreSelectionProbability = ({ skillMatch, experienceMatch, atsScore, applicantCount, hiringUrgency }) => {
  const applicantPenalty = Math.min(35, applicantCount / 15);
  const urgencyBoost = Math.min(20, (hiringUrgency || 1) * 3);
  const score = skillMatch * 0.4 + experienceMatch * 0.25 + atsScore * 0.2 + urgencyBoost - applicantPenalty;
  return Math.max(1, Math.min(99, Math.round(score)));
};

export const scoreGrowthPotential = (job) => {
  const stackScore = Math.min(30, (job.requiredSkills?.length || 0) * 2);
  const reputationScore = Math.min(30, (job.companyRating || 3) * 6);
  const salarySignal = job.salaryMax && job.salaryMin ? Math.min(20, (job.salaryMax - job.salaryMin) / 5000) : 10;
  const growthSignal = Math.min(20, (job.growthSignals?.length || 0) * 4);
  return Math.round(stackScore + reputationScore + salarySignal + growthSignal);
};

export const scoreAtsCompatibility = (resumeKeywords = [], jobDescription = "") => {
  const jdKeywords = extractKeywords(jobDescription);
  if (!jdKeywords.length) return 50;
  const r = new Set(resumeKeywords.map(normalize));
  const overlap = jdKeywords.filter((k) => r.has(normalize(k))).length;
  return Math.round((overlap / jdKeywords.length) * 100);
};

export const scoreKeywordMatch = (resumeText = "", jobDescription = "") => {
  const resumeKeywords = extractKeywords(resumeText);
  return scoreAtsCompatibility(resumeKeywords, jobDescription);
};

export const scoreEducationMatch = (userEducation = "", requiredEducation = "") => {
  if (!requiredEducation || requiredEducation.toLowerCase() === "any degree") return 100;
  if (!userEducation) return 50;
  return userEducation.toLowerCase().includes(requiredEducation.toLowerCase()) ? 100 : 60;
};

export const computeMatchScore = ({ skillMatch, experienceMatch, keywordMatch }) =>
  Math.round(skillMatch * 0.5 + experienceMatch * 0.3 + keywordMatch * 0.2);

export const weightedRanking = ({ skillMatch, experienceMatch, selectionProbability, growthScore, companyRating, educationMatch }) =>
  Math.round(
    skillMatch * 0.3 +
      experienceMatch * 0.2 +
      selectionProbability * 0.2 +
      growthScore * 0.15 +
      (companyRating * 20) * 0.1 +
      educationMatch * 0.05
  );
