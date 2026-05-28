import { Router } from "express";
import { getDashboardAnalytics, getRecommendations, getResumeHistory, optimizeResume, uploadResume } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();
router.get("/recommendations", protect, getRecommendations);
router.post("/resume/optimize", protect, optimizeResume);
router.post("/resume/upload", protect, upload.single("resume"), uploadResume);
router.get("/resume/history", protect, getResumeHistory);
router.get("/dashboard", protect, getDashboardAnalytics);
export default router;
