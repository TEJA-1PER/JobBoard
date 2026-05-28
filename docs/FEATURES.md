# get.hired+ Job Board — Feature Documentation

Complete reference for every product feature in the **get.hired+** AI job board (monorepo under `JobBoard/`).

---

## Table of contents

1. [Platform overview](#platform-overview)
2. [User roles](#user-roles)
3. [Authentication & account security](#authentication--account-security)
4. [Dashboard](#dashboard)
5. [Job search & saved jobs](#job-search--saved-jobs)
6. [AI job recommendations](#ai-job-recommendations)
7. [Applications & tracker](#applications--tracker)
8. [Resume builder & ATS optimization](#resume-builder--ats-optimization)
9. [ATS score & history](#ats-score--history)
10. [Cover letters](#cover-letters)
11. [Interview prep](#interview-prep)
12. [Career insights](#career-insights)
13. [Recruiter connect](#recruiter-connect)
14. [Premium upgrade](#premium-upgrade)
15. [Recruiter dashboard](#recruiter-dashboard)
16. [Admin panel](#admin-panel)
17. [AI matching engine (technical)](#ai-matching-engine-technical)
18. [API reference](#api-reference)
19. [Frontend routes](#frontend-routes)
20. [Data models](#data-models)

---

## Platform overview

**get.hired+** is a full-stack job board SaaS for job seekers and recruiters. It combines:

- **Job discovery** with filters, AI ranking, and saved jobs
- **AI matching** (skills, experience, keywords, selection probability, growth potential)
- **ATS tooling** (upload, optimize, score, version history)
- **Application lifecycle** (apply, preview, Kanban tracker)
- **Outreach templates** for recruiters and hiring managers
- **Market-style insights** derived from open listings

**Stack:** React (Vite) frontend, Express + MongoDB backend, JWT + refresh cookies, optional OAuth (Google, GitHub, LinkedIn).

---

## User roles

| Role | Default registration | Access |
|------|-------------------|--------|
| `job_seeker` | Yes | Dashboard, jobs, AI tools, applications, messages |
| `recruiter` | On register if chosen | Above + post jobs (`POST /api/jobs`), recruiter dashboard UI |
| `admin` | On register if chosen | Above + admin panel UI |

Role checks use `protect` + `authorize(...roles)` middleware on protected API routes and `ProtectedRoute` on the frontend.

---

## Authentication & account security

### What it does

- Email/password registration and login
- Short-lived **access JWT** (Bearer header) + **refresh token** (HTTP-only cookie)
- CSRF protection on state-changing auth endpoints
- Password reset via email link (30-minute token)
- Optional OAuth: Google, GitHub, LinkedIn (when env credentials are set)
- Session refresh and logout (invalidates refresh token hash in DB)

### Frontend

| Route | Page |
|-------|------|
| `/login` | Login |
| `/register` | Register (defaults to `job_seeker`) |
| `/auth/callback` | OAuth redirect handler (receives `token` query param) |
| `/reset-password` | Set new password from email link |
| `/terms`, `/privacy` | Legal placeholders |

### Password rules

- Minimum 8 characters
- Must include at least one letter and one number

### API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/auth/csrf-token` | No | Issue CSRF token for forms |
| `POST` | `/api/auth/register` | CSRF | Create account |
| `POST` | `/api/auth/login` | CSRF | Login |
| `POST` | `/api/auth/logout` | CSRF | Clear refresh session |
| `POST` | `/api/auth/refresh` | CSRF + cookie | Rotate access token |
| `POST` | `/api/auth/forgot-password` | CSRF | Send reset email |
| `POST` | `/api/auth/reset-password` | CSRF | Complete reset |
| `GET` | `/api/auth/me` | Bearer | Current user profile |
| `GET` | `/api/auth/google` | No | Start Google OAuth |
| `GET` | `/api/auth/google/callback` | No | Google callback |
| `GET` | `/api/auth/github` | No | Start GitHub OAuth |
| `GET` | `/api/auth/github/callback` | No | GitHub callback |
| `GET` | `/api/auth/linkedin` | No | Start LinkedIn OAuth |
| `GET` | `/api/auth/linkedin/callback` | No | LinkedIn callback |
| `GET` | `/api/auth/status` | No | Which OAuth providers are configured |
| `GET` | `/api/auth/failure` | No | OAuth failure redirect |

### Environment

See `backend/.env.example`: `JWT_SECRET`, `CLIENT_URL`, OAuth client IDs/secrets, SMTP for password reset.

---

## Dashboard

**Route:** `/dashboard`  
**API:** `GET /api/ai/dashboard`, `GET /api/jobs/ranked`, `GET /api/applications/me`

### What it shows

- **ATS Score** — from last optimization (`user.atsScore`)
- **Top job matches** — derived from ATS score
- **Applications** — total count and status breakdown
- **Profile strength** — heuristic from skills count + ATS score
- **Top 3 AI-ranked jobs** — quick list with match %, save bookmark, link to full search
- **Career activity** — recent applications
- **Resume insights** — static tips + link to resume builder
- **Quick links** — resume tailor, cover letters, interview prep, career roadmap cards

### Behavior

Dashboard analytics aggregate the signed-in user’s applications. Ranked jobs require authentication and use the same scoring as job search.

---

## Job search & saved jobs

**Routes:** `/jobs`, `/jobs?saved=true`  
**API:** `GET /api/jobs/ranked`, `POST/DELETE /api/jobs/:id/save`, `GET /api/jobs/saved/list`, `GET /api/jobs` (public list)

### Smart Jobs (`/jobs`)

Authenticated users see **AI-ranked** listings with per-job scores:

- Total match score
- Skill match %
- Selection probability
- Growth score
- Missing skills and recommendation bullets

### Filters (query + UI)

| Filter | Query param | Values |
|--------|-------------|--------|
| Keyword | `search` | Title, company, skills |
| Location | `location` | Regex on `location` |
| Work mode | `workMode` | `remote`, `hybrid`, `onsite` |
| Posted within | `postedWithin` | `24h`, `3d`, `7d` |
| Company type | `companyType` | `startup`, `mnc`, `product`, `service` |
| Saved only | `savedOnly=true` | Bookmarked jobs |
| Experience range | `minExperience`, `maxExperience` | Years |

### Sort options

| `sortBy` | Behavior |
|----------|----------|
| `best_match` (default) | Highest `ai.totalScore` |
| `selection_probability` | Highest selection probability |
| `growth_potential` | Highest growth score |
| `salary` | Highest `salaryMax` |
| `latest` | Newest `postedAt` |

### Saved jobs

- Save: `POST /api/jobs/:id/save`
- Unsave: `DELETE /api/jobs/:id/save`
- Sidebar link **Saved Jobs** → `/jobs?saved=true`

### Global header search

The app shell header searches by keyword + location and navigates to `/jobs?search=...&location=...`.

### Apply flow

From any job card, **Apply** opens `ApplyFlowModal`:

1. Optional cover letter and resume text override
2. **Run ATS Analysis** → `POST /api/applications/preview` (match score, missing skills, recommendations)
3. **Submit application** → `POST /api/applications`

### Job posting (recruiter/admin)

`POST /api/jobs` creates listings with fields from the [Job model](#job).

### Public job list

`GET /api/jobs` supports unauthenticated browse with filters (`search`, `location`, `workMode`, `experience`, `companyType`, `postedWithin`, `education`, `minSalary`, `selectionChance`, `growth`).

---

## AI job recommendations

**Route:** `/recommendations`  
**API:** `GET /api/ai/recommendations`

### What it does

Returns up to **50 jobs** sorted by AI total score, enriched with the same `ai` object as ranked search.

### Prerequisites

Recommendations are **empty** until the user has resume signal:

- Uploaded/pasted resume text (`user.resumeText`), or
- Profile skills (`user.profile.skills`)

Message shown: *"Upload your resume and run ATS optimization to unlock AI recommendations."*

### Labels

Each job may include AI labels such as **High Chance**, **Best Opportunity**, **Good Match**, **Competitive** based on thresholds on selection probability and total score.

---

## Applications & tracker

**Route:** `/tracker`  
**API:** `POST /api/applications`, `POST /api/applications/preview`, `GET /api/applications/me`, `PATCH /api/applications/:id/status`

### Application statuses (Kanban columns)

| Status | Meaning |
|--------|---------|
| `applied` | Submitted |
| `under_review` | Recruiter reviewing |
| `interview` | Interview stage |
| `rejected` | Not moving forward |
| `selected` | Offer / hired |

### On apply

- One application per user per job (unique index)
- Increments job `applicantCount`
- Stores **AI scores** snapshot: total, skill, experience, selection probability, growth, ATS compatibility, missing skills
- Timeline entry: `"Applied"`

### Preview (before submit)

`POST /api/applications/preview` body:

```json
{
  "jobId": "<jobId>",
  "resumeText": "<optional override>",
  "coverLetter": "<optional>"
}
```

Returns match score, selection probability, ATS compatibility, missing skills, recommendations.

### Status updates

Users can drag mentally via dropdown on each card; `PATCH` updates status and appends timeline label.

---

## Resume builder & ATS optimization

**Route:** `/resume-editor`  
**API:** `POST /api/ai/resume/upload`, `POST /api/ai/resume/optimize`, `GET /api/ai/resume/history`

### Upload

- **Formats:** `.pdf`, `.docx`, plain text
- Parses text, extracts skills into `user.profile.skills`, stores `user.resumeText`

### Optimize

Paste **resume** + **job description** → server:

1. Extracts keywords from both
2. Finds **missing keywords** vs job description
3. Computes **ATS score** (keyword match 50%, skills coverage 30%, formatting 20%)
4. Builds **optimized resume** (AI summary + enhanced skills block + original sections)
5. Saves `ResumeVersion` and updates `user.atsScore`

### Download

Frontend offers download of optimized text as `.txt`.

---

## ATS score & history

**Route:** `/ats-score`  
**API:** `GET /api/ai/dashboard`, `GET /api/ai/resume/history`

### What it shows

- **Current ATS score** (from user profile)
- **Recent ATS reports** — last 20 versions with score, timestamp, top missing keywords

Links to resume builder when no history exists.

---

## Cover letters

**Route:** `/cover-letters`  
**API:** `POST /api/messages/generate` (type `cold_outreach`), `GET /api/messages/me`

### What it does

Select a job → generate a **cold outreach** style letter (reused message template system). Lists past drafts filtered by `type === "cold_outreach"`.

> Cover letters share the recruiter message API with a fixed template type on this page.

---

## Interview prep

**Route:** `/interview-prep`  
**API:** `GET /api/jobs` (job list for selector)

### What it does

**Client-side** question generation when a job is selected:

- Up to 6 **technical** questions from `requiredSkills` (“Explain a project where you used {skill}…”)
- **Behavioral / situational** questions tied to company and role title

No dedicated backend endpoint; questions are built in the browser from job data.

---

## Career insights

**Route:** `/career-insights`  
**API:** `GET /api/jobs`

### What it shows (computed in frontend)

| Metric | Calculation |
|--------|-------------|
| Average salary (max) | Mean of `salaryMax` or `salaryMin` across listings |
| Remote job share | % of jobs with `workMode === "remote"` |
| Openings tracked | Total job count |
| Trending skills | Top 8 `requiredSkills` by frequency |
| Top locations | Top 5 locations by job count |

---

## Recruiter connect

**Route:** `/recruiter-connect`  
**API:** `POST /api/messages/generate`, `GET /api/messages/me`

### Message types

| `type` | Use case |
|--------|----------|
| `follow_up` | Application follow-up |
| `linkedin` | LinkedIn connection note |
| `referral` | Referral request |
| `interview_follow_up` | Post-interview thank you |
| `cold_outreach` | General outreach |
| `thank_you` | Gratitude message |

Templates personalize with user name, company, and job title. Messages are persisted with job reference and optional `recruiterEmail` from job posting.

---

## Premium upgrade

**Route:** `/premium`  
**API:** `GET /api/ai/dashboard` (read-only stats)

### What it does

Marketing-style upgrade page showing current ATS score, top matches, and application count. **No payment integration** in the current codebase — upgrade CTA in sidebar navigates here for future billing hooks.

---

## Recruiter dashboard

**Route:** `/recruiter` (roles: `recruiter`, `admin`)

### Current UI

Placeholder cards: Posted Jobs, AI Candidate Matching, Shortlisted Candidates.

### Backend capability

Recruiters can **create jobs** via `POST /api/jobs`. Full recruiter analytics UI is not yet implemented.

---

## Admin panel

**Route:** `/admin` (role: `admin`)

### Current UI

Placeholder cards: Platform Analytics, Recruiter Analytics, System Insights.

No dedicated admin API routes yet.

---

## AI matching engine (technical)

Implemented in `backend/src/services/aiScoringService.js` and `jobMatchService.js`.

### Inputs

- User: `resumeText`, `profile.skills`, `profile.experienceYears`, `profile.education`, `atsScore`
- Job: `requiredSkills`, `preferredSkills`, `description`, experience range, `applicantCount`, `hiringUrgency`, `companyRating`, `growthSignals`, salary range, `educationRequired`

### Scores

| Score | Formula (summary) |
|-------|-------------------|
| **Skill match** | 80% required skills overlap + 20% preferred |
| **Experience match** | Years vs `experienceMin` / `experienceMax` |
| **Keyword match** | Resume keywords vs job description keywords |
| **Combined skill score** | 50% skill + 30% experience + 20% keyword |
| **Selection probability** | Skill, experience, ATS, hiring urgency, applicant penalty (capped 1–99) |
| **Growth potential** | Skills breadth, company rating, salary spread, growth signals |
| **Education match** | 100 if “Any Degree” or match; else partial |
| **Total ranking** | Weighted: skill 30%, experience 20%, selection 20%, growth 15%, company rating 10%, education 5% |

### Recommendations array

Rule-based strings, e.g. missing skills list, keyword mirroring, experience gap hints.

### Skill extraction

Dictionary-based scan of resume text (`javascript`, `react`, `python`, etc.) in `resumeService.js`.

---

## API reference

Base URL: `http://localhost:5000` (or `VITE_API_URL`).  
Protected routes: `Authorization: Bearer <accessToken>`.

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service health |

### Auth

See [Authentication](#authentication--account-security).

### Jobs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/jobs` | No | List/filter jobs |
| `GET` | `/api/jobs/ranked` | Yes | AI-ranked list |
| `GET` | `/api/jobs/saved/list` | Yes | Saved jobs populated |
| `GET` | `/api/jobs/:id` | No | Single job |
| `POST` | `/api/jobs/:id/save` | Yes | Save job |
| `DELETE` | `/api/jobs/:id/save` | Yes | Unsave job |
| `POST` | `/api/jobs` | Recruiter/Admin | Create job |

### AI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/ai/recommendations` | Yes | Top AI job picks |
| `POST` | `/api/ai/resume/optimize` | Yes | Optimize resume for JD |
| `POST` | `/api/ai/resume/upload` | Yes | Multipart resume upload |
| `GET` | `/api/ai/resume/history` | Yes | Last 20 ATS versions |
| `GET` | `/api/ai/dashboard` | Yes | User analytics summary |

### Applications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/applications/preview` | Yes | ATS preview before apply |
| `POST` | `/api/applications` | Yes | Submit application |
| `GET` | `/api/applications/me` | Yes | List my applications |
| `PATCH` | `/api/applications/:id/status` | Yes | Update status |

### Messages

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| `POST` | `/api/messages/generate` | Yes | `{ jobId, type }` | Create template message |
| `GET` | `/api/messages/me` | Yes | — | List my messages |

### Example: create job (recruiter)

```json
POST /api/jobs
{
  "title": "Senior Frontend Engineer",
  "company": "Acme Corp",
  "description": "Build React apps...",
  "location": "Hyderabad",
  "workMode": "hybrid",
  "experienceMin": 3,
  "experienceMax": 6,
  "requiredSkills": ["react", "typescript"],
  "salaryMin": 18,
  "salaryMax": 28,
  "companyType": "product"
}
```

---

## Frontend routes

| Path | Component | Auth | Notes |
|------|-----------|------|-------|
| `/` | Home redirect | — | Landing / redirect |
| `/login` | AuthPage | Public | |
| `/register` | AuthPage | Public | |
| `/auth/callback` | OAuthCallbackPage | Public | |
| `/reset-password` | ResetPasswordPage | Public | |
| `/terms`, `/privacy` | LegalPage | Public | |
| `/dashboard` | DashboardPage | Yes | |
| `/jobs` | JobsPage | Yes | Smart search + saved |
| `/recommendations` | RecommendationsPage | Yes | |
| `/tracker` | ApplicationTrackerPage | Yes | Kanban |
| `/resume-editor` | ResumeEditorPage | Yes | |
| `/ats-score` | AtsScorePage | Yes | |
| `/cover-letters` | CoverLettersPage | Yes | |
| `/interview-prep` | InterviewPrepPage | Yes | |
| `/career-insights` | CareerInsightsPage | Yes | |
| `/premium` | PremiumPage | Yes | |
| `/recruiter-connect` | RecruiterConnectPage | Yes | |
| `/recruiter` | RecruiterPage | Recruiter/Admin | Placeholder UI |
| `/admin` | AdminPage | Admin | Placeholder UI |

### App shell features

- **Dark/light theme** toggle (`ThemeContext`)
- **Toast notifications** for API success/errors
- **Sidebar navigation** with premium upsell
- **React Query** for server state caching

---

## Data models

### User

- Identity: `name`, `email`, `password` (hashed), `role`, `provider`, `providerId`
- Profile: `title`, `summary`, `skills[]`, `experienceYears`, `education`, `preferredLocations`, `preferredWorkMode`
- Resume: `resumeText`, `atsScore`
- Security: refresh token hash/expiry, reset password token/expiry

### Job

- Core: `title`, `company`, `description`, `location`, `workMode`, experience range, education, salary range
- Skills: `requiredSkills[]`, `preferredSkills[]`
- Signals: `companyType`, `companyRating`, `hiringUrgency`, `applicantCount`, `growthSignals[]`
- Recruiter block: HR name, recruiter email, LinkedIn, hiring manager, etc.
- `postedBy`, `postedAt`

### Application

- `user`, `job`, `status`, `coverLetter`, `notes`
- `aiScores` snapshot, `timeline[]`

### ResumeVersion

- `originalText`, `optimizedText`, `targetJobDescription`, `atsScore`, `missingKeywords[]`, `extractedSkills[]`

### SavedJob

- Unique pair `(user, job)`

### Message

- `user`, `job`, `type`, `content`, `recruiterEmail`

---

## Related docs

- [README](../README.md) — setup, deployment, folder structure
- [backend/.env.example](../backend/.env.example) — configuration
- [frontend/.env.example](../frontend/.env.example) — `VITE_API_URL`

## Extending the product

- **OpenAI:** `OPENAI_API_KEY` is optional; scoring is rule-based today. Hook completions in `backend/src/services` for richer copy and questions.
- **Payments:** Wire `/premium` to Stripe or similar.
- **Recruiter/Admin UIs:** Connect placeholders to real analytics and job management APIs.
