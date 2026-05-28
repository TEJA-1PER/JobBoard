import { Router } from "express";
import { applyToJob, getMyApplications, previewApplication, updateApplicationStatus } from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/preview", protect, previewApplication);
router.post("/", protect, applyToJob);
router.get("/me", protect, getMyApplications);
router.patch("/:id/status", protect, updateApplicationStatus);
export default router;
