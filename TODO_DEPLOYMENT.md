# Deployment Checklist

## ✅ Files Created/Updated

### Backend (marketplace-backend)
- [x] `Procfile` - Railway web process entry point
- [x] `railway.json` - Railway deployment configuration
- [x] `.env.example` - Environment variables template
- [x] Updated `package.json` - Added build script
- [x] Updated `src/app.js` - CORS configured for production

### Frontend (marketplace-frontend)
- [x] `.env.example` - Environment variables template

---

## 📋 Deployment Steps

### Step 1: Push to GitHub
```bash
# Backend
cd marketplace-backend
git add .
git commit -m "Prepare for Railway deployment"
git remote add origin https://github.com/YOUR_USERNAME/marketplace-backend.git
git push -u origin main

# Frontend
cd marketplace-frontend
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/marketplace-frontend.git
git push -u origin main
```

### Step 2: Deploy Backend to Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `marketplace-backend` repository
4. Click "Variables" and add:
   ```
   DATABASE_URL=postgresql://user:password@host:port/db
   JWT_SECRET=your-super-secret-key-min-32-characters
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Click "New Database" → "PostgreSQL" (copy DATABASE_URL)
6. Railway auto-deploys

### Step 3: Deploy Frontend to Vercel
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Select `marketplace-frontend` repository
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
   ```
5. Click "Deploy"

### Step 4: Update CORS (After frontend deploys)
1. Copy Vercel URL (e.g., `https://marketplace-frontend.vercel.app`)
2. Add to Railway variables:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
3. Railway auto-redeploys

---

## 🔗 Required Accounts
- [ ] GitHub account with both repos
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)

## ✅ Verify Deployment
- Backend: `https://your-app.up.railway.app/` → should return `{"message":"API running"}`
- Frontend: `https://your-app.vercel.app` → should show marketplace UI

## ⚠️ Important Notes
1. Railway will automatically run Prisma migrations
2. Set JWT_SECRET to a strong random string (32+ characters)
3. Update FRONTEND_URL after frontend deployment for CORS
4. Check Railway logs if deployment fails

