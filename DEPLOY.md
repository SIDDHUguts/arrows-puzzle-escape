# Deploying Arrows — Puzzle Escape

This guide walks you through deploying the app to **Vercel** (frontend) and **Railway** (PostgreSQL database for future cloud features). The current prototype runs entirely client-side, so a database is optional for v1 — you can deploy to Vercel alone and add Railway later.

---

## Architecture

```
┌────────────────┐         ┌──────────────────┐
│   Vercel       │         │   Railway        │
│   (Next.js)    │ ──────▶ │   (PostgreSQL)   │
│                │  DATABASE_URL
│   Frontend     │         │   When you add   │
│   + API routes │         │   cloud features │
└────────────────┘         └──────────────────┘
```

- **Vercel** hosts the Next.js app (free tier is plenty for a prototype).
- **Railway** hosts PostgreSQL (free trial, then ~$5/month) — only needed when you add user accounts, cloud save, leaderboards, etc.

---

## Part 1 — Push to GitHub

Vercel and Railway both deploy from a Git repo. You need to push this project to GitHub first.

### 1.1 Create a GitHub repository

1. Go to [github.com/new](https://github.com/new).
2. Repository name: `arrows-puzzle-escape` (or whatever you prefer).
3. Set to **Private** (recommended for a prototype).
4. **Do NOT** initialize with README / .gitignore / license — the project already has these.
5. Click **Create repository**.

### 1.2 Push the project to GitHub

From your local terminal, in the project root:

```bash
# Replace <YOUR_USERNAME> with your GitHub username
git remote add origin https://github.com/<YOUR_USERNAME>/arrows-puzzle-escape.git
git branch -M main
git add .
git commit -m "Arrows — Puzzle Escape (investor prototype)"
git push -u origin main
```

If the project is in `/home/z/my-project` and you want to clone it elsewhere first:

```bash
# From your local machine (NOT the sandbox)
git clone https://github.com/<YOUR_USERNAME>/arrows-puzzle-escape.git
cd arrows-puzzle-escape
npm install
npm run dev
```

---

## Part 2 — Deploy to Vercel

### 2.1 Import the project

1. Go to [vercel.com/new](https://vercel.com/new).
2. Sign in with GitHub.
3. Click **Import** next to your `arrows-puzzle-escape` repo.
4. Vercel auto-detects Next.js — accept the defaults:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build` (leave default)
   - **Output Directory:** leave default
   - **Install Command:** `npm install` (or `bun install` if you use Bun)

### 2.2 Environment variables

For the prototype (no database), you can skip this step.

If you've added Railway PostgreSQL (Part 3), add:
- `DATABASE_URL` = your Railway Postgres connection string

### 2.3 Deploy

1. Click **Deploy**.
2. Wait ~2 minutes for the build to complete.
3. Vercel gives you a URL like `https://arrows-puzzle-escape.vercel.app`.
4. Click **Visit** to verify.

### 2.4 Custom domain (optional)

1. In Vercel: **Settings → Domains**.
2. Add your domain (e.g. `playarrowsgame.com`).
3. Update DNS at your registrar per Vercel's instructions.

---

## Part 3 — Provision PostgreSQL on Railway

Skip this section if you're not adding cloud features yet. Come back when you need user accounts, cloud save, leaderboards, etc.

### 3.1 Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project → Provision PostgreSQL**.
3. Railway creates a Postgres instance and shows you a connection string.

### 3.2 Get your connection string

1. In Railway, click your new **PostgreSQL** service.
2. Go to the **Connect** tab.
3. Copy the **Postgres Connection URL** (looks like `postgresql://postgres:PASSWORD@HOST:PORT/railway`).

### 3.3 Add the connection string to Vercel

1. Go back to Vercel → your project → **Settings → Environment Variables**.
2. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** (paste the Railway Postgres URL)
   - **Environment:** Production (and Preview if you want)
3. Click **Save**.
4. Trigger a redeploy: **Deployments → ⋮ → Redeploy**.

### 3.4 Switch Prisma to PostgreSQL

The local schema uses SQLite. For production, switch to PostgreSQL:

1. Edit `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Run the migration locally to verify:

   ```bash
   # Use a temporary local Postgres OR just push to Railway
   bun run db:push
   ```

3. Commit and push:

   ```bash
   git add prisma/schema.prisma
   git commit -m "Switch Prisma to PostgreSQL for production"
   git push
   ```

4. Vercel auto-redeploys. The build runs `prisma generate` automatically (it's in `postinstall`).

5. Initialize tables on Railway:

   ```bash
   # Install Railway CLI: npm i -g @railway/cli
   railway link      # select your project
   railway run bun run db:push
   ```

---

## Part 4 — Alternative: Deploy Next.js to Railway too

If you'd rather host everything on Railway (skip Vercel), you can deploy the Next.js app as a second service in the same Railway project.

### 4.1 Add a new service

1. In Railway: **New → GitHub Repo → select arrows-puzzle-escape**.
2. Railway auto-detects Next.js and uses Nixpacks to build.
3. Add environment variable:
   - `DATABASE_URL` = (reference the PostgreSQL service variable — Railway can link these)
4. Add a domain: **Settings → Networking → Generate Domain**.

### 4.2 Note on Vercel vs Railway for Next.js

- **Vercel** is the creator of Next.js → best-in-class support, edge functions, image optimization, analytics, free hobby tier.
- **Railway** is simpler (one platform for app + DB), but lacks Vercel's Next.js-specific optimizations.

**Recommendation:** Use Vercel for the Next.js app + Railway for Postgres. This is the most common pattern.

---

## Troubleshooting

### Build fails on Vercel with "Cannot find module"

Run `npm install` locally, commit `package-lock.json` (or `bun.lock`), and push again.

### Hydration errors in production

Already fixed — `suppressHydrationWarning` is on `<html>` and `<body>` to handle browser-extension-injected attributes.

### Prisma errors after switching to Postgres

Make sure `DATABASE_URL` is set in Vercel AND that you ran `db:push` against the Railway database. See Part 3.4.

### Game progress not saving across devices

That's expected — the prototype uses `localStorage` (per-device). Cross-device sync requires adding a `Progress` table in Prisma and API routes to load/save. That's a v2 feature.

### Need help?

- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Railway docs: [docs.railway.app](https://docs.railway.app)
- Next.js deployment: [nextjs.org/docs/app/building-your-application/deploying](https://nextjs.org/docs/app/building-your-application/deploying)

---

## Quick reference

| Step | Command / Link |
|------|----------------|
| Create GitHub repo | [github.com/new](https://github.com/new) |
| Push to GitHub | `git push -u origin main` |
| Import to Vercel | [vercel.com/new](https://vercel.com/new) |
| Provision Railway Postgres | [railway.app](https://railway.app) → New → PostgreSQL |
| Local dev | `bun run dev` (or `npm run dev`) |
| Lint | `bun run lint` |
| Verify levels | `bun run scripts/verify-levels.ts` |
