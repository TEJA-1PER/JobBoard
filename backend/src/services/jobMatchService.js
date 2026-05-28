import {
  computeMatchScore,
  scoreEducationMatch,
  scoreExperienceMatch,
  scoreGrowthPotential,
  scoreKeywordMatch,
  scoreSelectionProbability,
  scoreSkillMatch,
  weightedRanking
} from "./aiScoringService.js";
import { extractSkillsFromResume } from "./resumeService.js";

const normalize = (value) => value.trim().toLowerCase();

export const computeJobMatch = ({ user, job, resumeTextOverride = "" }) => {
  const resumeText = resumeTextOverride || user.resumeText || "";
  const parsedSkills = extractSkillsFromResume(resumeText);
  const profileSkills = [...new Set([...(user.profile?.skills || []), ...parsedSkills])];
  const requiredSkills = job.requiredSkills || [];
  const preferredSkills = job.preferredSkills || [];
  const requiredSet = new Set(requiredSkills.map(normalize));
  const profileSet = new Set(profileSkills.map(normalize));
  const missingSkills = requiredSkills.filter((skill) => !profileSet.has(normalize(skill)));

  const rawSkillMatch = scoreSkillMatch(profileSkills, requiredSkills, preferredSkills);
  const experienceMatch = scoreExperienceMatch(user.profile?.experienceYears || 0, job.experienceMin, job.experienceMax);
  const keywordMatch = scoreKeywordMatch(resumeText, job.description || "");
  const skillMatch = computeMatchScore({ skillMatch: rawSkillMatch, experienceMatch, keywordMatch });
  const growthScore = scoreGrowthPotential(job);
  const educationMatch = scoreEducationMatch(user.profile?.education || "", job.educationRequired);
  const selectionProbability = scoreSelectionProbability({
    skillMatch,
    experienceMatch,
    atsScore: user.atsScore || 50,
    applicantCount: job.applicantCount || 0,
    hiringUrgency: job.hiringUrgency || 2
  });
  const totalScore = weightedRanking({
    skillMatch,
    experienceMatch,
    selectionProbability,
    growthScore,
    companyRating: job.companyRating || 3.5,
    educationMatch
  });

  return {
    totalScore,
    skillMatch,
    experienceMatch,
    keywordMatch,
    selectionProbability,
    growthScore,
    educationMatch,
    parsedSkills,
    missingSkills,
    recommendations: [
      missingSkills.length ? `Add missing skills: ${missingSkills.slice(0, 5).join(", ")}` : "Skill coverage is strong for this role.",
      keywordMatch < 65 ? "Mirror role keywords in project and impact bullet points." : "Keyword coverage looks solid.",
      experienceMatch < 80 ? "Highlight equivalent or adjacent experience to close experience gap." : "Experience alignment is good."
    ]
  };
};
