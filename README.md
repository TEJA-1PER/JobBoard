<p align="center">
  <img src="docs/screenshots/logo.png" alt="Get.Hired logo" width="120" onerror="this.style.display='none'" />
</p>

<h1 align="center">Get.Hired</h1>

<p align="center">
  <strong>Modern AI-powered job board platform</strong> — smart discovery, resume intelligence, ATS scoring, and application tracking for job seekers and recruiters.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture-overview">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-api-documentation">API</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-ai-usage-report">AI Report</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?logo=githubactions&logoColor=white" alt="CI" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## Table of contents

1. [Project introduction](#-project-introduction)
2. [Feature overview](#-feature-overview)
3. [Tech stack](#-tech-stack)
4. [Architecture overview](#-architecture-overview)
5. [AI integration](#-ai-integration)
6. [Authentication](#-authentication)
7. [Database](#-database)
8. [CI/CD pipeline](#-cicd-pipeline)
9. [Deployment](#-deployment)
10. [Installation](#-installation)
11. [Environment variables](#-environment-variables)
12. [API integrations](#-api-integrations)
13. [Folder structure](#-folder-structure)
14. [Responsive design](#-responsive-design)
15. [Performance optimization](#-performance-optimization)
16. [Security best practices](#-security-best-practices)
17. [Screenshots](#-screenshots)
18. [Future improvements](#-future-improvements)
19. [Challenges faced](#-challenges-faced)
20. [Learning outcomes](#-learning-outcomes)
21. [Contribution guidelines](#-contribution-guidelines)
22. [License](#-license)
23. [AI usage report](#-ai-usage-report)
24. [Conclusion](#-conclusion)

**Supplementary docs:** [Feature reference](docs/FEATURES.md) · [Architecture](docs/ARCHITECTURE.md) · [Deployment guide](docs/DEPLOYMENT.md) · [AI usage report](docs/AI_USAGE.md)

---

## 🚀 Project introduction

**Get.Hired** (product name: **get.hired+**) is a full-stack, production-structured job board SaaS that helps candidates **discover roles**, **optimize resumes for ATS systems**, **quantify match quality**, and **manage applications** end-to-end. Recruiters can post listings; administrators have a dedicated panel for future platform analytics.

The platform combines:

- **Intelligent job matching** — multi-signal scoring (skills, experience, keywords, selection probability, growth potential)
- **Resume & ATS tooling** — upload, parse, tailor to job descriptions, version history
- **Application lifecycle** — preview match before apply, Kanban-style tracker, timeline events
- **Outreach automation** — recruiter message templates (LinkedIn, follow-up, referral, cold outreach)
- **Modern UX** — responsive layout, dark/light theme, animated interactions, role-based navigation

Built as a **monorepo** (`frontend/` + `backend/`) with clear separation of concerns, environment-driven configuration, and deployment targets for **Vercel** (SPA) and **Render/Railway/Docker** (API).

---

## ✨ Feature overview

| Feature | Description | Route / API |
|--------|-------------|-------------|
| **AI job recommendations** | Up to 50 jobs ranked by composite AI score with labels (High Chance, Best Opportunity, etc.) | `/recommendations` · `GET /api/ai/recommendations` |
| **Resume analyzer** | Upload PDF/DOCX or paste text; skills extracted into profile | `/resume-editor` · `POST /api/ai/resume/upload` |
| **ATS score checker** | Keyword, skills coverage, and formatting signals; history of last 20 runs | `/ats-score` · `GET /api/ai/resume/history` |
| **Resume tailoring** | Optimize resume against a job description; missing keywords + suggestions | `/resume-editor` · `POST /api/ai/resume/optimize` |
| **Job matching system** | Weighted ranking on every ranked job card | `GET /api/jobs/ranked` |
| **Smart job filtering** | Search, location, work mode, experience, company type, saved-only | `/jobs` + query params |
| **Search functionality** | Global header search + in-page filters | `/jobs?search=&location=` |
| **Job bookmarking** | Save/unsave jobs; dedicated saved view | `POST/DELETE /api/jobs/:id/save` |
| **Saved jobs** | Sidebar link filters to bookmarked listings | `/jobs?saved=true` |
| **Application tracker** | Kanban columns: applied → under review → interview → rejected → selected | `/tracker` |
| **Application tracking dashboard** | ATS score, top matches, application breakdown, quick links | `/dashboard` |
| **Apply flow with ATS preview** | Run analysis before submit | `POST /api/applications/preview` |
| **Profile management** | Skills, experience, education, resume text, ATS score on user model | `GET /api/auth/me` |
| **OAuth sign-in** | Google, GitHub, LinkedIn (when configured) | `/api/auth/{provider}` |
| **Email/password auth** | Register, login, refresh, password reset | `/login`, `/register` |
| **Admin dashboard** | Platform analytics placeholder (admin role) | `/admin` |
| **Recruiter dashboard** | Job posting capability + placeholder analytics | `/recruiter` |
| **Dark / light mode** | Persisted theme via `localStorage` | App shell toggle |
| **Responsive UI/UX** | Mobile-first Tailwind layouts | All pages |
| **Real-time UI updates** | TanStack Query cache invalidation & refetch after mutations | Dashboard, jobs, tracker |
| **AI-generated resume suggestions** | Rule-based summary, enhanced skills block, recommendation bullets | Resume optimize API |
| **Cover letters & outreach** | Template-based message generation | `/cover-letters`, `/recruiter-connect` |
| **Interview prep** | Client-generated questions from job skills | `/interview-prep` |
| **Career insights** | Salary, remote %, trending skills from listings | `/career-insights` |

> 📘 Deep dive per feature: **[docs/FEATURES.md](docs/FEATURES.md)**

---

## 🛠 Tech stack

### Frontend

| Technology | Role |
|------------|------|
| **React 18** | Component-based UI, hooks, context |
| **Vite 5** | Fast dev server, optimized production builds |
| **JavaScript (JSX)** | Application source (TypeScript types available via `@types/react`) |
| **Tailwind CSS 3** | Utility-first styling, dark mode (`class` strategy) |
| **Framer Motion 11** | Page and component animations |
| **React Router 6** | Client-side routing, protected routes |
| **TanStack React Query 5** | Server state, caching, refetch |
| **Axios** | HTTP client with interceptors |
| **React Hook Form + Zod** | Form validation |
| **Recharts** | Dashboard and insights charts |
| **Lucide React** | Icon system |
| **Sonner** | Toast notifications |

### Backend

| Technology | Role |
|------------|------|
| **Node.js 20** | Runtime |
| **Express 4** | REST API, middleware pipeline |
| **MongoDB + Mongoose 8** | Document database & ODM |
| **Passport.js** | OAuth 2.0 strategies (Google, GitHub, LinkedIn) |
| **JWT + HTTP-only cookies** | Access token + refresh token rotation |
| **bcryptjs** | Password hashing |
| **Helmet, CORS, rate limiting** | Security headers & abuse protection |
| **Multer, mammoth, pdf-parse** | Resume file parsing |
| **OpenAI SDK** | Optional; ready for LLM completions (`OPENAI_API_KEY`) |
| **Nodemailer** | Password reset emails |

### Authentication

| Method | Standard |
|--------|----------|
| Email / password | Bcrypt + JWT |
| Google OAuth | OAuth 2.0 via `passport-google-oauth20` |
| GitHub OAuth | OAuth 2.0 via `passport-github2` |
| LinkedIn OAuth | OAuth 2.0 via `passport-linkedin-oauth2` |
| CSRF | Token on state-changing auth routes |
| Session refresh | Rotating refresh token stored hashed in DB |

### DevOps & deployment

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | CI on push/PR (install + build matrix) |
| **Vercel** | Frontend static hosting (`vercel.json`) |
| **Render** | Backend web service (`render.yaml`) |
| **Docker** | Containerized API (`Dockerfile`) |

### AI tooling (development & product)

| Tool | Usage |
|------|--------|
| **OpenAI API** | Optional enrichment for resume copy and messaging |
| **ChatGPT / Cursor AI** | Accelerated development, debugging, documentation |
| **Custom scoring engine** | Production matching without mandatory LLM calls |

> **Note:** The codebase uses a **React + Vite SPA** and **MongoDB** (not Next.js App Router or Supabase). The architecture is equivalent in capability to modern JAMstack job platforms and can be migrated to Next.js or a BaaS later without changing domain models.

---

## 🏗 Architecture overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Client (Browser / Mobile)                        │
│  React SPA · React Router · TanStack Query · Tailwind · Framer Motion │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS
                                    │ Bearer JWT + cookies (refresh)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API Layer — Express (Node.js)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌───────────┐ │
│  │   Auth   │ │   Jobs   │ │    AI    │ │ Applications │ │ Messages  │ │
│  │  Routes  │ │  Routes  │ │  Routes  │ │    Routes    │ │  Routes   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘ └─────┬─────┘ │
│       │            │            │              │               │       │
│  ┌────▼────────────▼────────────▼──────────────▼───────────────▼─────┐  │
│  │ Controllers → Services (aiScoring, jobMatch, resume, message)    │  │
│  └────────────────────────────┬────────────────────────────────────┘  │
│                               │                                          │
│  ┌────────────────────────────▼────────────────────────────────────┐  │
│  │ Middleware: auth · CSRF · upload · rate limit · error handler      │  │
│  └────────────────────────────┬────────────────────────────────────┘  │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   MongoDB (Mongoose)    │
                    │ User · Job · Application│
                    │ ResumeVersion · SavedJob│
                    └────────────────────────┘
```

### Request flow (authenticated job search)

1. User logs in → receives **access JWT**; **refresh token** set in HTTP-only cookie.
2. Frontend calls `GET /api/jobs/ranked` with `Authorization: Bearer <token>`.
3. `jobMatchService` loads user profile + resume signals and scores each job via `aiScoringService`.
4. Response includes per-job `ai` object (scores, missing skills, recommendations).
5. React Query caches results; bookmark/apply mutations trigger **refetch** for near-instant UI sync.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for layer responsibilities and scoring formulas.

---

## 🤖 AI integration

### Product AI (runtime)

The **AI matching engine** runs server-side in `backend/src/services/aiScoringService.js` and `jobMatchService.js`:

| Signal | Weight / behavior |
|--------|-------------------|
| Skill match | 80% required + 20% preferred skills overlap |
| Experience match | Years vs job min/max range |
| Keyword match | Resume vs job description token overlap |
| ATS compatibility | Keyword density + formatting heuristics |
| Selection probability | Skills, experience, ATS, hiring urgency, applicant penalty |
| Growth potential | Stack breadth, company rating, salary spread, growth signals |
| **Total ranking** | Weighted composite for sort order |

**Resume optimization** (`resumeService.js`) extracts keywords, identifies gaps, computes ATS score, and produces an optimized draft with AI-style summary and enhanced skills section.

**Optional OpenAI:** Set `OPENAI_API_KEY` to extend services with LLM-generated copy; core scoring works **without** external AI calls (deterministic, cost-predictable).

### When recommendations unlock

Users need **resume text** or **profile skills** before `/api/ai/recommendations` returns ranked jobs—ensuring matches are grounded in real candidate data.

---

## 🔐 Authentication

### Email & password

- Registration with role: `job_seeker` (default), `recruiter`, or `admin`
- Password rules: minimum 8 characters, at least one letter and one number
- Forgot/reset password via SMTP (30-minute token expiry)

### OAuth 2.0 providers

| Provider | Start endpoint | Callback |
|----------|----------------|----------|
| Google | `GET /api/auth/google` | `/api/auth/google/callback` |
| GitHub | `GET /api/auth/github` | `/api/auth/github/callback` |
| LinkedIn | `GET /api/auth/linkedin` | `/api/auth/linkedin/callback` |

Frontend OAuth handler: `/auth/callback?token=...` stores access token and loads profile.

Check configured providers: `GET /api/auth/status`

### Token model

| Token | Storage | Lifetime |
|-------|---------|----------|
| Access JWT | `localStorage` + Axios header | Short (default 15m) |
| Refresh token | HTTP-only cookie | Rotated on `/api/auth/refresh` |
| CSRF | Header/cookie pair | Required on auth mutations |

---

## 🗄 Database

**MongoDB** with **Mongoose** schemas:

| Collection | Purpose |
|------------|---------|
| `users` | Identity, profile, resume text, ATS score, refresh token hash |
| `jobs` | Listings, skills, salary, recruiter metadata, applicant count |
| `applications` | Status, AI score snapshot, timeline |
| `resumeversions` | Optimization history (score, missing keywords) |
| `savedjobs` | Unique (user, job) bookmarks |
| `messages` | Generated outreach templates |

**Connection:** `MONGODB_URI` in backend `.env` (see `backend/src/config/db.js`).

Indexes include unique application per user/job pair and saved-job uniqueness.

---

## ⚙️ CI/CD pipeline

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

```yaml
# Triggers: push to main/master, all pull requests
# Matrix: backend + frontend (parallel jobs)
# Steps: checkout → Node 20 → npm ci/install → npm run build --if-present
```

| Stage | What it does |
|-------|----------------|
| **Trigger** | Push to `main`/`master` or any PR |
| **Matrix build** | Isolated jobs for `backend` and `frontend` |
| **Dependency cache** | `setup-node` with `cache: npm` per app lockfile |
| **Build verification** | Runs `vite build` on frontend; backend build if script exists |
| **Deployment** | Vercel auto-deploy on merge (connect repo in Vercel dashboard) |
| **API deploy** | Render/Railway/Docker per `render.yaml` / `Dockerfile` |

### Pipeline diagram

```
  Developer push/PR
         │
         ▼
  ┌──────────────┐
  │ GitHub Actions│
  │  lint/build   │
  └──────┬───────┘
         │ pass
    ┌────┴────┐
    ▼         ▼
 Vercel    Render/Docker
 (SPA)      (Express API)
```

**Build optimization:** Vite code-splitting, tree-shaking, and production minification; Express runs lean with helmet and rate limits in production.

Full guide: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

---

## 🚢 Deployment

### Frontend — Vercel

1. Import repository; set root to `JobBoard` (or monorepo path).
2. Framework preset: **Vite**; build command: `cd frontend && npm run build`; output: `frontend/dist`.
3. Environment: `VITE_API_URL=https://your-api.example.com/api`

`vercel.json` configures static build from `frontend/package.json`.

### Backend — Render / Railway / Docker

**Render** (`render.yaml`):

- Service type: web, `rootDir: backend`
- Build: `npm install` · Start: `npm run start`
- Secrets: `MONGODB_URI`, `JWT_SECRET`, OAuth keys, `OPENAI_API_KEY`

**Docker:**

```bash
docker build -t get-hired-api -f Dockerfile .
docker run -p 5000:5000 --env-file backend/.env get-hired-api
```

### Production checklist

- [ ] MongoDB Atlas (or managed cluster) with IP allowlist
- [ ] Strong `JWT_SECRET` and `SESSION_SECRET`
- [ ] `CLIENT_URL` set to production frontend origin(s)
- [ ] OAuth callback URLs updated in provider consoles
- [ ] SMTP configured for password reset
- [ ] CORS origins restricted to known domains

---

## 📦 Installation

### Prerequisites

- **Node.js** 20+
- **npm** 9+
- **MongoDB** 6+ (local or Atlas)

### Clone & run (development)

```bash
git clone https://github.com/<your-org>/get-hired.git
cd get-hired/JobBoard

# Terminal 1 — API
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, CLIENT_URL
npm install
npm run dev

# Terminal 2 — Web app
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

| App | Default URL |
|-----|-------------|
| Frontend | http://localhost:5174 (or Vite-assigned port) |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/api/health |

### Production build (local verify)

```bash
cd frontend && npm run build && npm run preview
cd backend && npm start
```

---

## 🔑 Environment variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/get_hired
JWT_SECRET=replace_with_secure_secret_min_32_chars
JWT_EXPIRES_IN=15m
SESSION_SECRET=replace_with_another_secure_secret
OPENAI_API_KEY=

CLIENT_URL=http://localhost:5174,http://localhost:5175
SERVER_URL=http://localhost:5000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/auth/linkedin/callback

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
FROM_EMAIL=no-reply@gethired.app
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit `.env` files. Use platform secret managers in production.

---

## 🔌 API integrations

### External services

| Integration | Purpose | Configuration |
|-------------|---------|---------------|
| **MongoDB Atlas** | Primary datastore | `MONGODB_URI` |
| **Google OAuth** | Social login | Google Cloud Console → OAuth credentials |
| **GitHub OAuth** | Social login | GitHub Developer Settings → OAuth App |
| **LinkedIn OAuth** | Social login | LinkedIn Developer Portal |
| **OpenAI** | Optional LLM features | `OPENAI_API_KEY` |
| **SMTP (e.g. SendGrid, Gmail)** | Password reset emails | `SMTP_*`, `FROM_EMAIL` |

### REST API surface (summary)

Base URL: `{API_HOST}/api`

| Group | Endpoints |
|-------|-----------|
| Health | `GET /health` |
| Auth | `/auth/register`, `/login`, `/logout`, `/refresh`, `/me`, OAuth routes |
| Jobs | `GET /jobs`, `GET /jobs/ranked`, save/unsave, `POST /jobs` (recruiter) |
| AI | `/ai/recommendations`, `/ai/resume/upload`, `/ai/resume/optimize`, `/ai/resume/history`, `/ai/dashboard` |
| Applications | `/applications/preview`, `POST /applications`, `GET /applications/me`, `PATCH /:id/status` |
| Messages | `POST /messages/generate`, `GET /messages/me` |

**Full reference:** [docs/FEATURES.md#api-reference](docs/FEATURES.md#api-reference)

### Example: optimize resume

```http
POST /api/ai/resume/optimize
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "resumeText": "Senior engineer with React and Node...",
  "jobDescription": "We need React, TypeScript, system design..."
}
```

### Example: ranked jobs

```http
GET /api/jobs/ranked?search=frontend&workMode=remote&sortBy=best_match
Authorization: Bearer <access_token>
```

---

## 📁 Folder structure

```txt
JobBoard/
├── .github/workflows/ci.yml      # GitHub Actions CI
├── backend/
│   ├── src/
│   │   ├── config/               # env, db, passport
│   │   ├── controllers/          # auth, jobs, ai, applications, messages
│   │   ├── middleware/           # auth, csrf, upload, errors
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # Express routers
│   │   ├── services/             # AI scoring, resume, job match, messages
│   │   ├── utils/                # tokens, errors
│   │   ├── data/                 # seed data
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # JobCard, ApplyFlowModal, ProtectedRoute
│   │   ├── context/              # Auth, Theme, Toast
│   │   ├── layouts/              # AppLayout (sidebar, header, search)
│   │   ├── lib/                  # Axios API client
│   │   ├── pages/                # Feature pages (dashboard, jobs, ATS, …)
│   │   ├── App.jsx               # Route definitions
│   │   ├── main.jsx              # Providers (Query, Theme, Auth)
│   │   └── index.css             # Tailwind entry
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── FEATURES.md               # Exhaustive feature & API docs
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── AI_USAGE.md
│   └── screenshots/              # Add PNGs here
├── Dockerfile
├── render.yaml
├── vercel.json
└── README.md
```

**Logical mapping** (requested enterprise layout):

| Conceptual layer | Location in repo |
|------------------|------------------|
| `app/` (routes/pages) | `frontend/src/pages/`, `App.jsx` |
| `components/` | `frontend/src/components/` |
| `features/` | Page-level feature modules under `pages/` |
| `hooks/` | Inline hooks + React Query |
| `lib/` | `frontend/src/lib/api.js` |
| `services/` | `backend/src/services/` |
| `utils/` | `backend/src/utils/` |
| `styles/` | `index.css` + Tailwind |
| `types/` | Zod schemas in forms; Mongoose models on API |

---

## 📱 Responsive design

- **Mobile-first Tailwind** breakpoints (`sm`, `md`, `lg`) on layout grids and navigation
- **Collapsible sidebar** pattern in `AppLayout` for smaller viewports
- **Touch-friendly** controls on job cards, filters, and Kanban tracker
- **Readable typography** scale and contrast in both light and dark themes
- **Framer Motion** used for subtle transitions without blocking interaction on low-end devices

Test targets: 375px (phone), 768px (tablet), 1280px+ (desktop).

---

## ⚡ Performance optimization

| Area | Technique |
|------|-----------|
| **Frontend bundle** | Vite production build, ES modules, tree-shaking |
| **Data fetching** | React Query caching, deduplicated requests, refetch on focus optional |
| **API** | Indexed MongoDB queries, lean JSON responses |
| **Rate limiting** | 300 requests / 15 min per IP on API |
| **Payload limits** | `express.json({ limit: "5mb" })` for resume uploads |
| **Static assets** | Served via Vercel CDN globally |
| **Scoring** | In-process deterministic algorithms (no per-job LLM latency) |

---

## 🔒 Security best practices

| Practice | Implementation |
|----------|----------------|
| Password hashing | bcrypt |
| Short-lived access tokens | JWT with expiry |
| Refresh token security | HTTP-only cookie, hashed at rest |
| CSRF | Token validation on auth mutations |
| HTTP headers | Helmet |
| CORS | Allowlist from `CLIENT_URL` |
| Rate limiting | `express-rate-limit` |
| Input validation | Joi on API; Zod on forms |
| Role-based access | `authorize('recruiter','admin')` middleware |
| Secrets | Environment variables only; `.env` gitignored |
| File uploads | Type/size checks in upload middleware |

**Operational:** Rotate `JWT_SECRET` on compromise; use MongoDB TLS in production; enable Vercel/Render HTTPS by default.

---

## 📸 Screenshots

Add captures under `docs/screenshots/` and embed here:

| Screen | File | Description |
|--------|------|-------------|
| Dashboard | `dashboard.png` | ATS score, top matches, applications |
| Smart Jobs | `jobs.png` | AI-ranked listings and filters |
| Recommendations | `recommendations.png` | Personalized job picks |
| Resume editor | `resume-editor.png` | Upload, tailor, download |
| ATS history | `ats-score.png` | Score timeline |
| Application tracker | `tracker.png` | Kanban board |
| Auth | `auth.png` | Login + OAuth buttons |
| Dark mode | `dark-mode.png` | Theme toggle |

```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

---

## 🔮 Future improvements

- [ ] Wire **OpenAI completions** for resume bullets, cover letters, and interview answers
- [ ] **Stripe** integration on `/premium`
- [ ] Full **recruiter & admin analytics** APIs and dashboards
- [ ] **WebSocket** or SSE for live application status notifications
- [ ] **Next.js** migration for SSR/SEO on public job pages
- [ ] **Elasticsearch** or Atlas Search for full-text job search at scale
- [ ] E2E tests (Playwright) in CI
- [ ] **i18n** for multi-locale job markets

---

## 🧩 Challenges faced

| Challenge | Approach |
|-----------|----------|
| **Consistent AI scores across features** | Centralized `aiScoringService` reused by jobs, applications, and recommendations |
| **OAuth redirect URLs across environments** | `SERVER_URL` + per-provider callback env vars; `GET /auth/status` for UI gating |
| **Secure refresh without XSS token theft** | Access token in memory/localStorage; refresh in HTTP-only cookie |
| **Resume parsing formats** | PDF + DOCX pipelines with graceful fallback to plain text |
| **Monorepo CI** | Matrix workflow with per-app `working-directory` |
| **Empty recommendations before profile data** | Explicit UX message until resume/skills exist |

---

## 📚 Learning outcomes

- Designing a **multi-signal ranking system** without over-relying on opaque LLM outputs
- Implementing **OAuth 2.0** and **JWT refresh** patterns in Express
- Structuring a **monorepo** for independent frontend/backend deploys
- Using **React Query** for predictable server-state UX
- Shipping **ATS-aware resume tooling** with version history and auditability
- Documenting a product for **technical assessment** and onboarding

---

## 🤝 Contribution guidelines

1. **Fork** the repository and create a feature branch (`feat/short-description`).
2. Follow existing **code style** (ES modules, async/await, Tailwind conventions).
3. Update **docs** (`README.md`, `docs/FEATURES.md`) when adding user-facing behavior.
4. Ensure **CI passes** (`npm run build` in `frontend` and `backend`).
5. Open a **pull request** with:
   - Summary of changes
   - Screenshots for UI updates
   - Test plan (manual steps or automated tests)
6. Do not commit secrets or `.env` files.

**Code of conduct:** Be respectful and constructive in reviews and issues.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 🧠 AI usage report

This project was built and refined with **AI-assisted development** while maintaining engineering ownership of architecture, security, and business logic.

| Area | How AI helped |
|------|----------------|
| **Development velocity** | Scaffolded routes, components, and service layers; iterated on UX copy |
| **Features improved** | Resume optimizer text, message templates, dashboard layouts, filter UX |
| **Prompt engineering** | Structured prompts for scoring explanations, API error messages, and docs |
| **Debugging** | Traced CORS/OAuth callback issues, React Query cache bugs, Mongoose validation |
| **UI generation** | Tailwind layouts, Framer Motion variants, responsive grid patterns |
| **Deployment setup** | `vercel.json`, `render.yaml`, Dockerfile, GitHub Actions matrix |
| **Documentation** | This README, `FEATURES.md`, architecture and deployment guides |

**Recruiter-facing summary:** AI acted as a **pair programmer** and **documentation accelerator**; core differentiators—the **matching engine**, **auth model**, and **data layer**—were designed and integrated deliberately, with deterministic scoring suitable for production cost control.

Full report: **[docs/AI_USAGE.md](docs/AI_USAGE.md)**

---

## ✅ Conclusion

**Get.Hired** demonstrates a **production-grade, full-stack job platform** with real differentiators: transparent AI matching, ATS resume tooling, OAuth authentication, application tracking, and a deployment story ready for Vercel + cloud API hosting. The codebase is modular, documented, and CI-backed—suitable for portfolio review, technical interviews, and continued extension toward payments, LLM enrichment, and enterprise analytics.

**Quick links**

- [Feature documentation](docs/FEATURES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [AI usage](docs/AI_USAGE.md)

---

<p align="center">
  Built with ❤️ for smarter hiring — <strong>Get.Hired</strong>
</p>
#   J o b B o a r d  
 