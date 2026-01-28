# Marketplace Platform - Complete Deployment Plan

**Document Version:** 1.0  
**Last Updated:** January 28, 2026  
**Estimated Time:** 30-45 minutes

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Environment Variables](#environment-variables)
6. [Testing the Deployment](#testing-the-deployment)
7. [Custom Domain Setup (Optional)](#custom-domain-setup-optional)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Troubleshooting](#troubleshooting)

---

## 1. Pre-Deployment Checklist

### ✅ Prerequisites Verification

| Requirement | Status | Action |
|-------------|--------|--------|
| GitHub repository created | ☐ | Create repo if not exists |
| Code pushed to GitHub | ☐ | Push both backend and frontend |
| Railway account | ☐ | Sign up at railway.app |
| Vercel account | ☐ | Sign up at vercel.com |
| PostgreSQL provider chosen | ☐ | Neon or Railway |

### ✅ Code Preparation

```bash
# Verify code is clean and ready
cd c:/dev

# Check repository status
git status

# Should show only:
# - marketplace-backend/
# - marketplace-frontend/
# - Documentation files (README, FINAL_SUMMARY, etc.)
```

### ✅ Environment Variables Preparation

Create a list of values you'll need:

| Variable | Source | Value |
|----------|--------|-------|
| `DATABASE_URL` | PostgreSQL provider | `postgresql://...` |
| `JWT_SECRET` | Generate random string | `openssl rand -base64 32` |
| `PORT` | Default | `5000` |
| `NODE_ENV` | Production | `production` |
| `NEXT_PUBLIC_API_URL` | Railway backend URL | `https://...up.railway.app` |

---

## 2. Database Setup

### Option A: Neon PostgreSQL (Recommended)

#### Step 1: Create Neon Account
1. Navigate to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" → Choose GitHub login
3. Authorize Neon to access your GitHub

#### Step 2: Create New Project
1. Click "New Project"
2. Name: `marketplace-db`
3. Select region closest to your users
4. Click "Create Project"

#### Step 3: Get Connection String
1. Click "Connection Details"
2. Copy the connection string:
   ```
   postgres://user:password@ep-xxx.region.neon.tech/marketplace-db
   ```
3. **Save this securely** - you'll need it for Railway

#### Step 4: Configure Connection Pool (Optional)
For production, add to connection string:
```
?connection_limit=10
```

---

### Option B: Railway PostgreSQL

#### Step 1: Create Project
1. Go to [https://railway.app](https://railway.app)
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Wait for database to provision

#### Step 2: Get Connection String
1. Click on the PostgreSQL service
2. Go to "Variables" tab
3. Find `DATABASE_URL`
4. Copy the value

---

## 3. Backend Deployment (Railway)

### Step 1: Connect GitHub Repository

1. Navigate to [https://railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository containing `marketplace-backend/`

### Step 2: Configure Service

1. **Root Directory:** Leave as empty (auto-detect)
2. **Build Command:** 
   ```bash
   npx prisma generate
   ```
3. **Start Command:**
   ```bash
   npm start
   ```
4. **Health Check Path:** `/api/protected`

### Step 3: Set Environment Variables

In Railway dashboard → Variables tab, add:

```bash
# Required
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-super-secret-jwt-key-here

# Optional but recommended
PORT=5000
NODE_ENV=production
```

#### Generate Secure JWT_SECRET

```bash
# Using OpenSSL (Linux/Mac/WSL)
openssl rand -base64 32

# Using PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 255 }))
```

### Step 4: Deploy

1. Click "Deploy"
2. Watch the build logs
3. Wait for deployment to complete (green checkmark)

### Step 5: Verify Backend

1. Click the generated URL (e.g., `https://marketplace-backend.up.railway.app`)
2. Test the protected endpoint:
   ```bash
   curl https://your-app.up.railway.app/api/protected
   ```
   Expected: 401 Unauthorized (no token provided)
   
3. Test API health:
   ```bash
   curl https://your-app.up.railway.app/api/auth/register -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","password":"password123"}'
   ```
   Expected: 201 Created

---

## 4. Frontend Deployment (Vercel)

### Step 1: Connect GitHub Repository

1. Navigate to [https://vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select your repository containing `marketplace-frontend/`
4. Vercel auto-detects Next.js

### Step 2: Configure Project

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | marketplace-frontend |
| Build Command | `next build` |
| Output Directory | `.next` |

### Step 3: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```bash
# Required
NEXT_PUBLIC_API_URL=https://your-backend-app.up.railway.app
```

**Important:** Use the Railway backend URL (not localhost!)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app is now live!

### Step 5: Verify Frontend

1. Visit your Vercel domain (e.g., `https://marketplace-frontend.vercel.app`)
2. You should see the landing page
3. Click "Login" or "Register"
4. Verify the page loads correctly

---

## 5. Environment Variables Summary

### Backend (Railway)

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | Secure random string (32+ chars) | ✅ Yes |
| `PORT` | `5000` | Optional |
| `NODE_ENV` | `production` | Optional |

### Frontend (Vercel)

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_API_URL` | Railway backend URL | ✅ Yes |

---

## 6. Testing the Deployment

### Test 1: User Registration

```bash
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"password123","role":"ADMIN"}'
```

**Expected:** 201 Created with user data

### Test 2: User Login

```bash
curl -X POST https://your-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

**Expected:** 200 OK with JWT token

### Test 3: Protected Endpoint

```bash
curl https://your-backend.up.railway.app/api/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** 200 OK with user data

### Test 4: Frontend to Backend Connection

1. Open frontend URL in browser
2. Try to register/login
3. Check browser DevTools → Network tab
4. Verify API calls go to Railway backend (not localhost)

---

## 7. Custom Domain Setup (Optional)

### Backend (Railway)

1. **Go to Railway Dashboard**
   - Navigate to your backend service
   - Click "Settings" → "Domains"

2. **Add Custom Domain**
   - Enter: `api.yourdomain.com`
   - Click "Add"

3. **Configure DNS**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: api
     Value: your-app.up.railway.app
     ```

4. **Wait for DNS Propagation**
   - Usually 5-30 minutes
   - Use `dig api.yourdomain.com` to verify

### Frontend (Vercel)

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Settings" → "Domains"

2. **Add Custom Domain**
   - Enter: `www.yourdomain.com` or `yourdomain.com`
   - Click "Add"

3. **Configure DNS**
   - **For apex domain (yourdomain.com):**
     ```
     Type: ALIAS/A
     Name: @
     Value: 76.76.21.21
     ```
   - **For www subdomain:**
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

4. **SSL Certificate**
   - Vercel automatically provisions Let's Encrypt
   - Usually ready within 5 minutes

### Update Environment Variables

After setting custom domain:

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 8. Post-Deployment Verification

### ✅ Verification Checklist

| Test | Command/Action | Expected Result |
|------|----------------|-----------------|
| Backend health | `curl https://backend.up.railway.app/api/protected` | 401 Unauthorized |
| User registration | Register new user via frontend | Success message |
| User login | Login with registered user | JWT token received |
| Create project | Buyer creates project | Project created (UNASSIGNED) |
| Browse projects | Solver views open projects | Project visible |
| Assign solver | Buyer assigns solver | Project ASSIGNED |
| Create task | Solver creates task | Task created |
| Submit task | Solver submits ZIP | Task SUBMITTED |
| Accept task | Buyer accepts task | Task COMPLETED |

### Performance Verification

```bash
# Check API response time
time curl -s -o /dev -w "%{time_total}s\n" https://your-backend.up.railway.app/api/auth/login

# Expected: < 1 second
```

### Security Verification

1. ✅ JWT_SECRET is not default value
2. ✅ DATABASE_URL contains credentials
3. ✅ No hardcoded secrets in code
4. ✅ CORS configured for production domain

---

## 9. Troubleshooting

### Issue: "Database connection failed"

**Cause:** Invalid DATABASE_URL or network issue

**Solutions:**
1. Verify DATABASE_URL format:
   ```
   postgresql://username:password@host:5432/database
   ```
2. Check PostgreSQL is running (Neon/Railway status page)
3. Whitelist Railway IPs in Neon if needed

### Issue: "CORS error"

**Cause:** Frontend domain not allowed in backend CORS

**Solutions:**
1. Update CORS in `marketplace-backend/src/app.js`:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
   }));
   ```
2. Set `FRONTEND_URL` in Railway to your Vercel domain

### Issue: "File uploads fail"

**Cause:** No file storage configured for production

**Solutions:**
1. For MVP: Files stored locally (will be lost on restart)
2. Production: Configure AWS S3 or Supabase Storage

### Issue: "JWT token invalid"

**Cause:** JWT_SECRET mismatch or expired token

**Solutions:**
1. Verify JWT_SECRET is same in all environments
2. Generate new token after login
3. Check token hasn't expired (1 day default)

### Issue: "Frontend shows localhost API calls"

**Cause:** NEXT_PUBLIC_API_URL points to localhost

**Solutions:**
1. Update Vercel environment variable
2. Redeploy frontend after change

---

## 📊 Cost Breakdown

| Service | Plan | Monthly Cost | Notes |
|---------|------|--------------|-------|
| Railway (Backend) | Starter | $5-20 | Depends on usage |
| Vercel (Frontend) | Hobby | $0 | Free for personal |
| Neon (Database) | Free | $0 | 10GB storage |
| **Total** | | **$5-20/month** | |

---

## 🚀 Quick Deploy Commands

### Deploy Backend
```bash
cd marketplace-backend
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')"
git push origin main
```

### Deploy Frontend
```bash
cd marketplace-frontend
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')"
git push origin main
```

### Automated Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Deploying Marketplace Platform..."

# Backend
echo "📦 Deploying backend..."
cd marketplace-backend
git add .
git commit -m "Deploy: $(date)" 2>/dev/null || echo "No changes"
git push origin main

# Frontend
echo "🎨 Deploying frontend..."
cd ../marketplace-frontend
git add .
git commit -m "Deploy: $(date)" 2>/dev/null || echo "No changes"
git push origin main

echo "✅ Deployments triggered! Check Railway and Vercel dashboards."
```

Run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📞 Post-Deployment Checklist

- [ ] Backend URL recorded
- [ ] Frontend URL recorded
- [ ] Custom domain configured (if applicable)
- [ ] All environment variables set
- [ ] Integration tests pass
- [ ] User registration working
- [ ] Full workflow tested
- [ ] Monitoring set up
- [ ] Backup strategy configured

---

**Document Complete**  
**Next Step:** Follow the steps above to deploy your marketplace platform to production.

---

**Need Help?**
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)

