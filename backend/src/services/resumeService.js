import { extractKeywords, scoreAtsCompatibility } from "./aiScoringService.js";

const sectionize = (text) => text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

export const extractSkillsFromResume = (resumeText = "") => {
  const techDictionary = [
    "javascript", "typescript", "node", "react", "express", "mongodb", "python", "java", "aws", "docker",
    "kubernetes", "sql", "redis", "nextjs", "tailwind", "graphql", "rest", "ci/cd", "git", "machine", "ai"
  ];
  const lower = resumeText.toLowerCase();
  return techDictionary.filter((s) => lower.includes(s));
};

export const optimizeResumeForJob = (resumeText, jobDescription) => {
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jobDescription);
  const missingKeywords = jdKeywords.filter((k) => !resumeKeywords.includes(k)).slice(0, 20);
  const keywordMatchScore = scoreAtsCompatibility(resumeKeywords, jobDescription);
  const skills = extractSkillsFromResume(resumeText);
  const jdSkillCoverage = Math.min(100, Math.round((skills.length / Math.max(1, (jdKeywords.length / 8))) * 100));
  const formattingScore = Math.min(100, Math.max(45, 100 - Math.round(resumeText.length < 400 ? 30 : 0) - Math.round((resumeText.match(/\n/g) || []).length < 8 ? 20 : 0)));
  const atsScore = Math.round(keywordMatchScore * 0.5 + jdSkillCoverage * 0.3 + formattingScore * 0.2);
  const blocks = sectionize(resumeText);
  const summary = `AI-Optimized Summary: Product-minded engineer with proven delivery across ${missingKeywords.slice(0, 5).join(", ") || "modern stacks"} and measurable outcomes.`;
  const enhancedSkills = `AI-Enhanced Skills: ${[...new Set([...skills, ...missingKeywords.slice(0, 8)])].join(", ")}`;
  const optimizedText = [summary, enhancedSkills, ...blocks].join("\n\n");

  return {
    optimizedText,
    atsScore,
    scoreBreakdown: {
      keywordMatchScore,
      formattingScore,
      skillsCoverageScore: jdSkillCoverage
    },
    missingKeywords,
    recommendations: [
      "Add measurable metrics in experience bullet points",
      "Include 1-2 domain-specific project outcomes",
      "Mirror top mandatory keywords from job description"
    ]
  };
};
