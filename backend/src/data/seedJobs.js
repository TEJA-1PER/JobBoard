import { Job } from "../models/Job.js";

export const seedDemoJobs = async (recruiterId) => {
  const count = await Job.countDocuments();
  if (count > 0 || !recruiterId) return;

  await Job.insertMany([
    {
      title: "Software Development Engineer II",
      company: "Microsoft",
      description: "Build scalable product experiences and backend services.",
      location: "Hyderabad",
      workMode: "hybrid",
      experienceMin: 3,
      experienceMax: 5,
      educationRequired: "B.Tech",
      salaryMin: 28,
      salaryMax: 45,
      requiredSkills: ["React", "TypeScript", "Node.js"],
      preferredSkills: ["Azure", "System Design"],
      companyType: "product",
      companyRating: 4.6,
      hiringUrgency: 4,
      growthSignals: ["promotion path", "global teams", "mentorship"],
      recruiter: { recruiterName: "Anita Rao", recruiterEmail: "anita@microsoft.com", linkedinProfile: "https://linkedin.com/in/anita" },
      postedBy: recruiterId
    },
    {
      title: "Full Stack Engineer",
      company: "Amazon",
      description: "Own full stack systems powering customer experiences.",
      location: "Hyderabad",
      workMode: "hybrid",
      experienceMin: 2,
      experienceMax: 4,
      educationRequired: "Any Degree",
      salaryMin: 24,
      salaryMax: 38,
      requiredSkills: ["Java", "Spring Boot", "AWS"],
      preferredSkills: ["React", "DynamoDB"],
      companyType: "mnc",
      companyRating: 4.4,
      hiringUrgency: 5,
      growthSignals: ["ownership", "fast promotions", "high impact"],
      recruiter: { recruiterName: "Ritika Shah", recruiterEmail: "ritika@amazon.com", linkedinProfile: "https://linkedin.com/in/ritika" },
      postedBy: recruiterId
    },
    {
      title: "Backend Developer",
      company: "Swiggy",
      description: "Develop resilient APIs for high-throughput systems.",
      location: "Bengaluru",
      workMode: "hybrid",
      experienceMin: 2,
      experienceMax: 3,
      educationRequired: "B.Tech",
      salaryMin: 18,
      salaryMax: 30,
      requiredSkills: ["Node.js", "Express", "MongoDB"],
      preferredSkills: ["Redis", "Kafka"],
      companyType: "product",
      companyRating: 4.1,
      hiringUrgency: 4,
      growthSignals: ["scale", "learning budget", "leadership exposure"],
      recruiter: { recruiterName: "Sahil Verma", recruiterEmail: "sahil@swiggy.com", linkedinProfile: "https://linkedin.com/in/sahil" },
      postedBy: recruiterId
    }
  ]);
};
