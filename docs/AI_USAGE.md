# Get.Hired — AI Usage Report

Professional summary of how **artificial intelligence** accelerated development and powers product features—suitable for portfolio and recruiter review.

---

## Executive summary

**Get.Hired** uses AI in two distinct ways:

1. **Product AI** — Deterministic matching and resume optimization engines that behave predictably in production (low latency, no per-request LLM cost required).
2. **Development AI** — ChatGPT, Cursor AI, and optional OpenAI API integration to accelerate implementation, debugging, and documentation.

This separation shows mature engineering judgment: **AI where it adds user value**, not AI everywhere by default.

---

## How AI accelerated development

| Phase | AI contribution |
|-------|----------------|
| **Scaffolding** | Express route structure, React page shells, Mongoose models |
| **UI/UX** | Tailwind layout variants, Framer Motion transitions, responsive grids |
| **Business logic** | Draft scoring formulas refined with human review |
| **OAuth integration** | Passport strategy wiring and callback URL troubleshooting |
| **DevOps** | `vercel.json`, `render.yaml`, GitHub Actions matrix workflow |
| **Documentation** | README, FEATURES.md, architecture and deployment guides |

**Estimated impact:** 30–50% faster iteration on boilerplate and documentation; core architecture and security decisions remained human-led.

---

## Features generated or improved with AI

| Feature | AI role |
|---------|---------|
| Resume optimizer copy | AI-style summary and skills enhancement blocks |
| Message templates | Outreach text patterns for recruiter connect |
| Dashboard UX | Layout suggestions and microcopy |
| Job card metadata | Display labels for match tiers |
| Interview prep questions | Client-side question templates from skills |
| API documentation | Endpoint tables and examples |
| Error messages | Clearer user-facing validation text |

**Implemented in code without mandatory LLM calls:** job ranking, ATS score, application preview, recommendations sorting.

---

## Prompt engineering usage

Examples of structured prompts used during development:

- *"Design a weighted job scoring function using skill overlap, experience years, and applicant count penalty."*
- *"Generate Express middleware for JWT protect + role authorize."*
- *"Create a Kanban application tracker UI with Tailwind dark mode support."*
- *"Document OAuth callback flow for Google, GitHub, and LinkedIn with environment variables."*

**Practices applied:**

- Provide file context and stack constraints in each prompt  
- Request **diff-friendly** output (single files, ES modules)  
- Ask for **security checklist** on auth-related changes  
- Iterate with **failure logs** (CORS, 401, validation errors)

---

## AI-assisted debugging

| Issue type | AI-assisted resolution |
|------------|------------------------|
| CORS / credentials | Aligned `CLIENT_URL` with Vite port and `credentials: true` |
| OAuth redirect mismatch | Callback URL env vs provider console |
| React Query stale data | `refetch` on mutation success |
| Mongoose validation | Schema field alignment with request body |
| CSRF on auth routes | Token fetch before register/login |

---

## AI-assisted UI generation

- Sidebar navigation and premium upsell placement  
- Filter bar on jobs page  
- ATS score history cards  
- Toast notifications via Sonner  
- Dark mode toggle with `class` on `<html>`

All components were **reviewed and integrated** into the existing design system (indigo primary, rounded cards, consistent spacing).

---

## AI-assisted deployment setup

Generated and validated:

- Multi-stage CI matrix for `frontend` + `backend`  
- Vercel static build configuration  
- Render service definition  
- Dockerfile for portable API hosting  

---

## AI-assisted documentation generation

This report and the main [README](../README.md) were produced with AI assistance, then **verified against the repository** (routes, env vars, stack versions) for accuracy.

---

## Optional OpenAI API integration

The backend includes the `openai` npm package. Set:

```env
OPENAI_API_KEY=sk-...
```

**Recommended extensions:**

- Resume bullet rewriting  
- Personalized cover letter paragraphs  
- Behavioral interview answer outlines  

Keep **scoring and ranking** deterministic unless product requirements explicitly need LLM judgment.

---

## Ethics and transparency

- Users are not misled: match scores are **explainable** (skills, experience, keywords).  
- OAuth only requests standard profile scopes.  
- No training on user resumes without explicit consent (future policy if adding LLM upload to OpenAI).  

---

## Conclusion for recruiters

AI was used as a **force multiplier** for a solo/small-team delivery cadence—not as a substitute for system design. The candidate demonstrates:

- Ability to **ship a full-stack product**  
- Judgment on **when not to call an LLM**  
- Comfort with **modern AI dev tools** (Cursor, ChatGPT, OpenAI SDK)  
- Clear **written communication** for technical assessment

---

## Related

- [README](../README.md#-ai-usage-report)
- [FEATURES.md — AI matching engine](FEATURES.md#ai-matching-engine-technical)
