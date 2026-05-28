import { Router } from "express";
import passport from "passport";
import {
  forgotPassword,
  login,
  logout,
  me,
  oauthFailure,
  oauthSuccess,
  refresh,
  register,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { issueCsrfToken, verifyCsrf } from "../middleware/csrfMiddleware.js";
import { AppError } from "../utils/error.js";

const router = Router();
const failureRedirect = "/api/auth/failure";

const requireStrategy = (name) => (req, res, next) => {
  if (!passport._strategy(name)) {
    console.warn(`[OAuth] Strategy not configured: ${name}`);
    return next(new AppError(`${name} OAuth is not configured`, 503));
  }
  console.log(`[OAuth] Starting ${name} auth flow`);
  return next();
};

const logCallback = (provider) => (req, res, next) => {
  console.log(`[OAuth] ${provider} callback hit`, { query: req.query });
  next();
};

router.get("/csrf-token", issueCsrfToken);
router.post("/register", verifyCsrf, register);
router.post("/login", verifyCsrf, login);
router.post("/logout", verifyCsrf, logout);
router.post("/refresh", verifyCsrf, refresh);
router.post("/forgot-password", verifyCsrf, forgotPassword);
router.post("/reset-password", verifyCsrf, resetPassword);
router.get("/me", protect, me);
router.get("/failure", oauthFailure);

router.get(
  "/google",
  requireStrategy("google"),
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  logCallback("google"),
  requireStrategy("google"),
  passport.authenticate("google", { session: false, failureRedirect }),
  oauthSuccess
);

router.get("/github", requireStrategy("github"), passport.authenticate("github", { session: false }));
router.get(
  "/github/callback",
  logCallback("github"),
  requireStrategy("github"),
  passport.authenticate("github", { session: false, failureRedirect }),
  oauthSuccess
);

router.get(
  "/linkedin",
  requireStrategy("linkedin"),
  passport.authenticate("linkedin", { scope: ["openid", "profile", "email"], session: false })
);
router.get(
  "/linkedin/callback",
  logCallback("linkedin"),
  requireStrategy("linkedin"),
  passport.authenticate("linkedin", { session: false, failureRedirect }),
  oauthSuccess
);

router.get("/status", (req, res) => {
  res.json({
    success: true,
    providers: {
      google: Boolean(passport._strategy("google")),
      github: Boolean(passport._strategy("github")),
      linkedin: Boolean(passport._strategy("linkedin"))
    }
  });
});

export default router;
