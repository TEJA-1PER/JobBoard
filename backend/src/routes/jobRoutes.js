import { Router } from "express";
import {
  createJob,
  getJob,
  getRankedJobs,
  listJobs,
  listSavedJobs,
  saveJob,
  unsaveJob
} from "../controllers/jobController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", listJobs);
router.get("/ranked", protect, getRankedJobs);
router.get("/saved/list", protect, listSavedJobs);
router.get("/:id", getJob);
router.post("/:id/save", protect, saveJob);
router.delete("/:id/save", protect, unsaveJob);
router.post("/", protect, authorize("recruiter", "admin"), createJob);
export default router;
