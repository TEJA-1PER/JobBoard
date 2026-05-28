import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
    recruiterEmail: String,
    type: {
      type: String,
      enum: ["follow_up", "linkedin", "referral", "interview_follow_up", "cold_outreach", "thank_you"],
      default: "follow_up"
    },
    content: String,
    sentAt: Date,
    reminderAt: Date
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
