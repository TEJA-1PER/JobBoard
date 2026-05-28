import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, minlength: 6 },
    provider: { type: String, enum: ["local", "google", "github", "linkedin"], default: "local", index: true },
    providerId: { type: String, default: null, index: true },
    emailVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String, default: null, index: true },
    resetPasswordExpires: { type: Date, default: null },
    refreshTokenHash: { type: String, default: null, index: true },
    refreshTokenExpires: { type: Date, default: null },
    role: { type: String, enum: ["job_seeker", "recruiter", "admin"], default: "job_seeker", index: true },
    profile: {
      title: String,
      summary: String,
      skills: [String],
      experienceYears: { type: Number, default: 0 },
      education: String,
      preferredLocations: [String],
      preferredWorkMode: { type: String, enum: ["remote", "hybrid", "onsite", "any"], default: "any" }
    },
    atsScore: { type: Number, default: 0 },
    resumeText: { type: String, default: "" }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    provider: this.provider,
    emailVerified: this.emailVerified,
    profile: this.profile,
    atsScore: this.atsScore,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const User = mongoose.model("User", userSchema);
