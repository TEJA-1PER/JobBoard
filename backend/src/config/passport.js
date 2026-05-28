import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import crypto from "node:crypto";
import { User } from "../models/User.js";

const serverUrl = (process.env.SERVER_URL || "http://localhost:5000").replace(/\/$/, "");

const callbackUrl = (envKey, fallbackPath) => {
  const fromEnv = process.env[envKey];
  if (fromEnv) return fromEnv;
  return `${serverUrl}${fallbackPath}`;
};

const ensureOAuthUser = async ({ provider, providerId, email, name }) => {
  let user = await User.findOne({ provider, providerId });

  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (!user) {
    user = await User.create({
      name: name || "New User",
      email: email || `${providerId}@${provider}.oauth.local`,
      password: crypto.randomUUID(),
      role: "job_seeker",
      provider,
      providerId,
      emailVerified: true
    });
    console.log(`[OAuth] Created user via ${provider}:`, user.email);
  } else {
    user.provider = provider;
    user.providerId = providerId;
    if (name && (!user.name || user.name === "New User")) user.name = name;
    if (!user.emailVerified) user.emailVerified = true;
    await user.save();
    console.log(`[OAuth] Linked existing user via ${provider}:`, user.email);
  }

  return user;
};

const extractEmail = (profile) => {
  const direct = profile.emails?.[0]?.value;
  if (direct) return direct;
  if (profile._json?.email) return profile._json.email;
  return null;
};

const registerStrategy = (name, factory) => {
  if (passport._strategy(name)) {
    passport.unuse(name);
  }
  passport.use(name, factory());
};

export const configurePassport = () => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    registerStrategy(
      "google",
      () =>
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: callbackUrl("GOOGLE_CALLBACK_URL", "/api/auth/google/callback")
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const user = await ensureOAuthUser({
                provider: "google",
                providerId: profile.id,
                email: extractEmail(profile),
                name: profile.displayName
              });
              done(null, user);
            } catch (error) {
              console.error("[OAuth] Google strategy error:", error.message);
              done(error, null);
            }
          }
        )
    );
    console.log("[OAuth] Google strategy configured.");
  } else {
    console.warn("[OAuth] Google not configured (missing GOOGLE_CLIENT_ID/SECRET).");
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    registerStrategy(
      "github",
      () =>
        new GitHubStrategy(
          {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: callbackUrl("GITHUB_CALLBACK_URL", "/api/auth/github/callback"),
            scope: ["user:email"]
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const user = await ensureOAuthUser({
                provider: "github",
                providerId: profile.id,
                email: extractEmail(profile),
                name: profile.displayName || profile.username
              });
              done(null, user);
            } catch (error) {
              console.error("[OAuth] GitHub strategy error:", error.message);
              done(error, null);
            }
          }
        )
    );
    console.log("[OAuth] GitHub strategy configured.");
  } else {
    console.warn("[OAuth] GitHub not configured (missing GITHUB_CLIENT_ID/SECRET).");
  }

  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    registerStrategy(
      "linkedin",
      () =>
        new LinkedInStrategy(
          {
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: callbackUrl("LINKEDIN_CALLBACK_URL", "/api/auth/linkedin/callback"),
            scope: ["openid", "profile", "email"]
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const user = await ensureOAuthUser({
                provider: "linkedin",
                providerId: profile.id,
                email: extractEmail(profile),
                name: profile.displayName
              });
              done(null, user);
            } catch (error) {
              console.error("[OAuth] LinkedIn strategy error:", error.message);
              done(error, null);
            }
          }
        )
    );
    console.log("[OAuth] LinkedIn strategy configured.");
  } else {
    console.warn("[OAuth] LinkedIn not configured (missing LINKEDIN_CLIENT_ID/SECRET).");
  }
};

export default passport;
