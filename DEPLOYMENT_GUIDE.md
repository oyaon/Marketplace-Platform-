# Deployment Guide

## Overview
This guide covers deploying the Marketplace application to production:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway or Render.com
- **Database**: PostgreSQL (Neon or Railway)

---

## 1. Database Setup (PostgreSQL)

### Option A: Neon (Recommended)
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://...`)
4. Save for backend setup

### Option B: Railway
1. Go to [https://railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy connection URL

---

## 2. Backend Deployment (Railway)

### Prerequisites
- Git repository on GitHub
- Railway account
- Database connection string

### Steps

1. **Push to GitHub**
   ```bash
   cd marketplace-backend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/marketplace-backend
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will detect Node.js automatically

3. **Set Environment Variables**
   In Railway dashboard → Variables:
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   JWT_SECRET=your-super-secret-key-change-this-in-production
   PORT=5000
   NODE_ENV=production
   ```

4. **Generate Prisma Client**
   - In Railway dashboard, go to Service settings
   - Add build command: `npm run build` (or `npx prisma generate`)
   - Save and deploy

5. **Run Migrations**
   - Add post-deploy command: `npx prisma migrate deploy`
   - This runs automatically after each deploy

### Verify Backend is Running
```bash
curl https://your-railway-app.up.railway.app
# Should return: { "message": "API running" }
```

---

## 3. Frontend Deployment (Vercel)

### Prerequisites
- Frontend pushed to GitHub
- Vercel account

### Steps

1. **Push Frontend to GitHub**
   ```bash
   cd marketplace-frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/marketplace-frontend
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

3. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Verify Frontend is Running
- Visit your Vercel domain (e.g., `https://marketplace-frontend.vercel.app`)
- You should see the login page

---

## 4. Database Migrations

### Initial Setup (First Deploy)
```bash
# Locally first to test
npx prisma migrate dev --name init

# Then on Railway, migrations run automatically via post-deploy command
```

### Adding New Migrations
```bash
# Create migration locally
npx prisma migrate dev --name descriptive_name

# Push to GitHub
git add prisma/migrations/
git commit -m "Add migration: descriptive_name"
git push

# Railway auto-runs migrations on deploy
```

---

## 5. Connect Frontend to Backend

Update `src/lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-backend-url.up.railway.app";
```

Or set via Vercel environment variables (recommended).

---

## 6. SSL/TLS (HTTPS)

Both Railway and Vercel provide free SSL certificates automatically. No additional setup needed.

---

## 7. File Uploads (ZIP Files)

### Current Setup (Local Development)
- Files saved to `uploads/` folder
- Works for development only

### Production Setup Options

#### Option 1: AWS S3 (Recommended for scale)
1. Create S3 bucket
2. Install AWS SDK: `npm install aws-sdk`
3. Update upload middleware:

```javascript
const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `uploads/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const result = await s3.upload(params).promise();
  return result.Location; // Public URL
};
```

4. Update task controller to use S3 URLs

#### Option 2: Railway's Built-in File Storage
- Railway provides ephemeral storage
- Files deleted when container restarts
- Not recommended for production

#### Option 3: Supabase Storage
```bash
npm install @supabase/supabase-js
```

### Environment Variables (Production)
```
AWS_ACCESS_KEY=your-key
AWS_SECRET_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
```

---

## 8. Monitoring & Logs

### Railway Dashboard
- Service dashboard shows logs in real-time
- CPU/Memory usage
- Deployment history
- Rollback capability

### Vercel Dashboard
- Build logs
- Runtime logs
- Performance metrics
- Analytics

---

## 9. Domain Setup (Optional)

### Add Custom Domain
1. **Railway Backend**
   - Dashboard → Service → Settings → Domains
   - Add custom domain
   - Configure DNS records

2. **Vercel Frontend**
   - Dashboard → Settings → Domains
   - Add custom domain
   - Follow DNS setup instructions

---

## 10. Rollback & Monitoring

### Railway Rollback
1. Go to Deployments tab
2. Select previous deployment
3. Click "Redeploy"

### Vercel Rollback
1. Go to Deployments
2. Find previous deployment
3. Click "Promote to Production"

---

## 11. Production Checklist

- [ ] JWT_SECRET is unique and strong
- [ ] DATABASE_URL uses production database
- [ ] NEXT_PUBLIC_API_URL points to production backend
- [ ] File upload configured (S3 or equivalent)
- [ ] Database backups configured
- [ ] SSL/TLS enabled (automatic)
- [ ] Rate limiting configured
- [ ] CORS configured properly
- [ ] Environment variables secured
- [ ] Monitoring/logging set up
- [ ] Custom domain configured (optional)

---

## 12. Local Testing Before Deploy

```bash
# Backend
npm install
NODE_ENV=production npm start

# Frontend (test build)
npm run build
npm start
```

---

## 13. Troubleshooting

### "Database connection failed"
- Verify DATABASE_URL is correct
- Check PostgreSQL whitelist IP (if needed)
- Ensure migrations have run

### "CORS error"
- Backend needs to allow frontend origin
- Update CORS in src/app.js:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
  }));
  ```

### "File uploads fail"
- Check disk space on Railway
- Verify S3 credentials if using S3
- Check file permissions

### "Slow API responses"
- Check database query performance
- Add indexes to frequently queried fields
- Implement caching if needed

---

## 14. Cost Estimates (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Railway (Backend) | Starter | $5-50 |
| Vercel (Frontend) | Free | $0 |
| Neon (Database) | Free tier | $0 (paid at scale) |
| AWS S3 (Files) | Pay-as-you-go | $0.023/GB stored |

**Total:** ~$5-50/month minimum

---

## Quick Deploy Script

```bash
#!/bin/bash

# Backend
cd marketplace-backend
git add .
git commit -m "Deploy: $(date)"
git push origin main

# Frontend
cd ../marketplace-frontend
git add .
git commit -m "Deploy: $(date)"
git push origin main

echo "✅ Deployments triggered on Railway and Vercel"
```

Save as `deploy.sh`, run with `chmod +x deploy.sh && ./deploy.sh`

