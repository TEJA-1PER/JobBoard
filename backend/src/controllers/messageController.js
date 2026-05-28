import { Message } from "../models/Message.js";
import { Job } from "../models/Job.js";
import { asyncHandler, AppError } from "../utils/error.js";
import { generateRecruiterMessage } from "../services/messageService.js";

export const generateMessage = asyncHandler(async (req, res) => {
  const { jobId, type } = req.body;
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);
  const content = generateRecruiterMessage({
    type,
    userName: req.user.name,
    company: job.company,
    jobTitle: job.title
  });
  const message = await Message.create({
    user: req.user._id,
    job: job._id,
    recruiterEmail: job.recruiter?.recruiterEmail,
    type,
    content
  });
  res.status(201).json({ success: true, message });
});

export const listMyMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ user: req.user._id }).populate("job");
  res.json({ success: true, messages });
});
