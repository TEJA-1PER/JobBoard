import { Router } from "express";
import { generateMessage, listMyMessages } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/generate", protect, generateMessage);
router.get("/me", protect, listMyMessages);
export default router;
