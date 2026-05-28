# Get.Hired — Deployment Guide

Step-by-step deployment for **frontend (Vercel)** and **backend (Render / Docker)**.

---

## Prerequisites

- GitHub repository connected to Vercel and Render (or Railway)
- MongoDB Atlas cluster
- OAuth apps configured for production domains
- SMTP provider for password reset (optional but recommended)

---

## 1. MongoDB Atlas

1. Create a free/paid cluster.
2. Create database user and whitelist deployment IPs (`0.0.0.0/0` for serverless APIs with caution).
3. Copy connection string → `MONGODB_URI`.

---

## 2. Backend (Render)

The repo includes [`render.yaml`](../render.yaml):

```yaml
services:
  - type: web
    name: ai-job-board-api
    env: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm run start
```

### Render dashboard steps

1. **New → Web Service** → connect repo.
2. Root directory: `backend` (or use Blueprint from `render.yaml`).
3. Add environment variables from [README environment section](../README.md#-environment-variables).
4. Set `CLIENT_URL` to your Vercel URL (e.g. `https://get-hired.vercel.app`).
5. Update OAuth callback URLs to `https://<api-host>/api/auth/.../callback`.
6. Deploy and verify: `GET https://<api-host>/api/health`.

### Docker alternative

```bash
cd JobBoard
docker build -t get-hired-api .
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="..." \
  -e CLIENT_URL="https://your-app.vercel.app" \
  get-hired-api
```

---

## 3. Frontend (Vercel)

[`vercel.json`](../vercel.json) points at the Vite frontend:

```json
{
  "version": 2,
  "builds": [{ "src": "frontend/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }],
  "routes": [{ "src": "/(.*)", "dest": "/frontend/$1" }]
}
```

### Vercel dashboard steps

1. Import Git repository.
2. **Root Directory:** `JobBoard/frontend` (adjust if repo root differs).
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment variable:** `VITE_API_URL=https://<api-host>/api`
6. Deploy.

### SPA routing

Configure a rewrite so all paths serve `index.html` (Vercel usually auto-detects Vite SPAs).

---

## 4. CI/CD (GitHub Actions)

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

| Event | Action |
|-------|--------|
| Push to `main` | Build backend + frontend |
| Pull request | Same validation |

**Recommended additions:**

- `npm run lint` in backend job  
- Playwright/Cypress E2E on PR  
- Deploy preview via Vercel Git integration (automatic)

### Deployment pipeline (target state)

```
PR opened → CI build/lint → Vercel Preview URL
Merge to main → CI → Vercel Production + Render Production
```

---

## 5. OAuth provider configuration

| Provider | Redirect URI pattern |
|----------|---------------------|
| Google | `https://<api>/api/auth/google/callback` |
| GitHub | `https://<api>/api/auth/github/callback` |
| LinkedIn | `https://<api>/api/auth/linkedin/callback` |

Authorized JavaScript origins: your Vercel frontend URL only (for client-side flows if added later).

---

## 6. Post-deploy verification

| Check | Command / action |
|-------|------------------|
| API health | `curl https://<api>/api/health` |
| Auth status | `curl https://<api>/api/auth/status` |
| Register/login | Manual test on production URL |
| OAuth | Complete one provider sign-in |
| Jobs | Load `/jobs` while authenticated |
| CORS | No browser CORS errors in DevTools |

---

## 7. Rollback strategy

- **Vercel:** Promote previous deployment from dashboard.  
- **Render:** Roll back to previous deploy or pin Docker image tag.  
- **Database:** Avoid destructive migrations without backups (Atlas snapshots).

---

## Related

- [README](../README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
