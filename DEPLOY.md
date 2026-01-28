# Marketplace Platform - Deployment Guide

## Quick Deploy (5 minutes)

### Prerequisites
- GitHub account
- Railway account (free at https://railway.app)
- Vercel account (free at https://vercel.com)

---

## Step 1: Database Setup (PostgreSQL)

### Option A: Use Railway PostgreSQL (Recommended)

1. Go to [Railway](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Provision PostgreSQL"**
4. Wait for database to provision (1-2 minutes)
5. Click on the PostgreSQL service → **Variables** tab
6. Copy `DATABASE_URL` (you'll need this later)

### Option B: Use Neon PostgreSQL

1. Go to [Neon](https://neon.tech) and sign up
2. Click **"New Project"**
3. Name: `marketplace-db`
4. Copy connection string from **Connection Details**

---

## Step 2: Deploy Backend (Railway)

1. Go to [Railway](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose repository: `oyaon/Marketplace-Platform-`
5. **Important:** Set Root Directory to: `marketplace-backend`
6. Click **"Deploy"**

### Configure Environment Variables

In Railway dashboard → Your Service → **Variables** tab, add:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=any-secure-random-string-like-this-32-chars
PORT=5000
NODE_ENV=production
```

**To generate JWT_SECRET:**
- Run: `openssl rand -base64 32` (Linux/Mac/WSL)
- Or use: `https://generate-secret.vercel.app/32`

### Redeploy

1. Click **"Redeploy"** in Railway
2. Wait for build to complete (2-3 minutes)
3. Check **Logs** for any errors

### Get Backend URL

Once deployed, your backend URL will be shown (e.g., `https://marketplace-backend.up.railway.app`)

---

## Step 3: Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Choose repository: `oyaon/Marketplace-Platform-`
4. **Important:** Set Root Directory to: `marketplace-frontend`
5. Click **"Deploy"**

### Configure Environment Variable

In Vercel dashboard → Your Project → **Settings** → **Environment Variables**, add:

```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
```

**Replace with your actual Railway backend URL!**

### Redeploy

1. Click **"Redeploy"** in Vercel
2. Wait for build to complete

---

## Step 4: Test the Deployment

### Backend Health Check
```bash
curl https://your-railway-app.up.railway.app/api/protected
# Expected: {"message":"Access granted","user":...}
```

### Full Workflow Test

1. Open your Vercel frontend URL
2. Register as ADMIN
3. Login as ADMIN
4. Assign yourself BUYER role (or create another user)
5. Login as BUYER → Create a project
6. Login as SOLVER → Browse projects → Request
7. Login as BUYER → Assign solver
8. Login as SOLVER → Create task → Submit ZIP
9. Login as BUYER → Accept task

---

## Troubleshooting

### "Build failed" in Railway
- Check the **Logs** tab in Railway
- Common issues:
  - Missing `DATABASE_URL`
  - Invalid `DATABASE_URL` format
  - Missing `JWT_SECRET`

### "CORS error" in browser
- Add `FRONTEND_URL` in Railway with your Vercel domain:
  ```
  FRONTEND_URL=https://your-project.vercel.app
  ```

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running (Neon/Railway status)

### Frontend shows "localhost" API calls
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Must point to Railway URL, not localhost

---

## Cost

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Railway (Backend) | Starter | $5-20 |
| Vercel (Frontend) | Hobby | $0 (Free) |
| Railway PostgreSQL | Starter | $0 (Free tier) |
| **Total** | | **$5-20/month** |

---

## Commands

### Push Updates to Production

```bash
cd c:/dev
git add -A
git commit -m "Update: description"
git push origin main
```

Railway and Vercel will auto-deploy from the main branch.

---

## Architecture

```
GitHub Repository
       │
       ├── marketplace-backend/  → Deploys to Railway
       │      └── PostgreSQL
       │
       └── marketplace-frontend/ → Deploys to Vercel
              └── API calls Railway
```

---

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://prisma.io/docs

