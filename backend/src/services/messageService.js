export const generateRecruiterMessage = ({ type, userName, company, jobTitle }) => {
  const templates = {
    follow_up: `Hello,\n\nI wanted to follow up on my application for ${jobTitle} at ${company}. I remain very interested and would value the opportunity to discuss how I can contribute.\n\nBest,\n${userName}`,
    linkedin: `Hi, I am ${userName}. I came across the ${jobTitle} role at ${company} and found it aligned with my profile. I would appreciate connecting and learning more about the team.`,
    referral: `Hello,\n\nI am applying for ${jobTitle} at ${company}. If possible, I would appreciate your guidance or a referral. Happy to share my resume and relevant work.\n\nRegards,\n${userName}`,
    interview_follow_up: `Hello,\n\nThank you for taking the time to interview me for ${jobTitle}. I enjoyed our conversation and remain excited about contributing to ${company}.\n\nSincerely,\n${userName}`,
    cold_outreach: `Hello,\n\nI am reaching out regarding opportunities at ${company}. My profile aligns with ${jobTitle}-like roles and I would love to explore if there is a fit.\n\nBest,\n${userName}`,
    thank_you: `Hello,\n\nThank you for your time and support during my hiring process for ${jobTitle}. I truly appreciate the guidance.\n\nRegards,\n${userName}`
  };
  return templates[type] || templates.follow_up;
};
