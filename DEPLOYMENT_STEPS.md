# Marketplace Backend - Deployment Configuration
# =============================================

## Deployment Platforms

### Railway (Backend)
1. Go to https://railway.app
2. Create new project → "Deploy from GitHub repo"
3. Select your backend repository
4. Railway will auto-detect Node.js

### Vercel (Frontend)
1. Go to https://vercel.com
2. "Add New..." → "Project"
3. Select your frontend repository
4. Vercel auto-detects Next.js

## Environment Variables

### Backend (Railway)
Set these in Railway dashboard → Variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-project.vercel.app
```

**Important:** Add PostgreSQL database in Railway dashboard and copy the DATABASE_URL

### Frontend (Vercel)
Set in Vercel → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
```

## Database Setup

### Option 1: Railway PostgreSQL (Recommended)
1. In Railway project dashboard, click "New Database"
2. Select "PostgreSQL"
3. Copy the DATABASE_URL from the database service
4. Add to backend environment variables

### Option 2: Neon PostgreSQL
1. Go to https://neon.tech
2. Create project → Copy connection string
3. Use as DATABASE_URL

## Deployment Steps

### 1. Push to GitHub
```bash
# Backend
cd marketplace-backend
git add .
git commit -m "Prepare for deployment"
git remote add origin https://github.com/YOUR_USERNAME/marketplace-backend.git
git push -u origin main

# Frontend
cd ../marketplace-frontend
git add .
git commit -m "Prepare for deployment"
git remote add origin https://github.com/YOUR_USERNAME/marketplace-frontend.git
git push -u origin main
```

### 2. Deploy Backend to Railway
1. Railway dashboard → New Project
2. "Deploy from GitHub repo"
3. Select marketplace-backend
4. Click "Variables" tab
5. Add all backend environment variables:
   - DATABASE_URL (from PostgreSQL service)
   - JWT_SECRET (generate a strong random string)
   - PORT=5000
   - NODE_ENV=production
   - FRONTEND_URL (will be updated after frontend deployment)
6. Railway will automatically:
   - Run `npm install`
   - Run `npm run build` (Prisma generate)
   - Run migrations with `npx prisma migrate deploy`
   - Start the server

### 3. Deploy Frontend to Vercel
1. Vercel dashboard → "Add New..." → "Project"
2. Import marketplace-frontend from GitHub
3. In "Environment Variables" section, add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-railway-app.up.railway.app` (use your actual Railway URL)
4. Click "Deploy"

### 4. Update CORS and Finalize
1. After frontend deployment, copy the Vercel URL (e.g., `https://marketplace-frontend.vercel.app`)
2. Update Railway backend environment variable:
   - Add `FRONTEND_URL=https://your-vercel-app.vercel.app`
3. Trigger a redeploy on Railway (or it will auto-redeploy)

## Verify Deployment

### Backend
```bash
curl https://your-railway-app.up.railway.app/
# Expected: {"message":"API running"}
```

### Frontend
1. Open https://your-vercel-app.vercel.app
2. Should see the marketplace login page

## Troubleshooting

### "Database connection failed"
- Verify DATABASE_URL is correct
- Ensure migrations ran: check Railway logs
- Try redeploying after adding DATABASE_URL

### CORS errors
- Make sure FRONTEND_URL is set in Railway
- Redeploy after setting FRONTEND_URL

### Prisma generate errors
- Ensure `npm run build` script exists
- Check Railway build logs

### Frontend can't reach backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check browser console for CORS errors

## Custom Domains (Optional)

### Railway Backend
1. Railway → Service → Settings → Domains
2. Add custom domain
3. Configure DNS as instructed

### Vercel Frontend
1. Vercel → Project → Settings → Domains
2. Add custom domain
3. Configure DNS as instructed

## Costs
- Railway: ~$5-50/month (depends on usage)
- Vercel: Free tier available
- PostgreSQL: Free tier on Railway or Neon

