# Bugfix Report - Deployment Issues

## Date: 2026-01-29

---

## Issues Fixed

### 1. Prisma Migration Error (P3005)
**Error:**
```
Error: P3005
The database schema is not empty. Read more about how to baseline an existing production database: https://pris.ly/d/migrate-baseline
```

**Root Cause:** 
- The Neon database already contains tables from a previous deployment
- Prisma has no migration history in `prisma/migrations` folder
- `prisma migrate deploy` fails because it expects an empty database or proper migration history

**Solution:**
- Created baseline migration `00000000000000_init` to sync with existing database schema
- Added `migration_lock.toml` to track the database provider

### 2. Port Binding Issue
**Error:**
```
No open ports detected, continuing to scan...
==> Exited with status 1
```

**Root Cause:**
- The server was not properly binding to Railway's dynamic `$PORT` environment variable
- Server was listening only on localhost, not on 0.0.0.0

**Solution:**
- Updated `src/server.js` to parse PORT as integer and bind to `0.0.0.0`

---

## Files Modified

### 1. `marketplace-backend/prisma/migrations/00000000000000_init/migration.sql`
**Purpose:** Baseline migration for existing database schema

**Content:**
- All CREATE TABLE statements for User, Project, Request, Task, Submission models
- All CREATE TYPE statements for enums (Role, ProjectStatus, TaskStatus, RequestStatus)
- All CREATE INDEX statements
- All ALTER TABLE ADD CONSTRAINT statements for foreign keys

### 2. `marketplace-backend/prisma/migrations/migration_lock.toml`
**Purpose:** Tracks database provider for migration locking

**Content:**
```
provider = "postgresql"
```

### 3. `marketplace-backend/src/server.js`
**Changes:**
```javascript
// Before:
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => { ... });

// After:
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => { ... });
```

### 4. `marketplace-backend/railway.json`
**Changes:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "nodeVersion": "20"
  },
  "deploy": {
    "startCommand": "npx prisma generate && npx prisma migrate deploy && npm start",
    "healthcheckPath": "/api/protected",
    "healthcheckTimeout": 60,
    "restartPolicy": "always",
    "environmentVariables": {
      "NODE_ENV": "production"
    }
  }
}
```

### 5. `marketplace-backend/prisma.config.ts`
**Changes:**
- Added embrace callback for migration processing
- Enhanced migration configuration

---

## Deployment Steps After Fix

1. **Commit and push changes:**
   ```bash
   cd marketplace-backend
   git add .
   git commit -m "fix: baseline database migration and port binding"
   git push
   ```

2. **Trigger Railway redeploy:**
   - Go to Railway dashboard
   - The deployment should automatically trigger on push
   - Or manually trigger a redeploy

3. **Verify deployment:**
   - Check logs for "PostgreSQL connected"
   - Check logs for "Server running on port X host 0.0.0.0"
   - Access healthcheck endpoint: `https://your-app.railway.app/api/protected`

---

## Rollback Plan

If the fix doesn't work, rollback by:
1. Removing the migrations folder content (keep empty folder)
2. Reverting server.js changes
3. Redeploying to trigger fresh migration

---

## Verification Checklist

- [x] Migration files created
- [x] Migration lock file created
- [x] Server.js updated for port binding
- [x] Railway.json updated with Node.js version
- [x] Prisma config updated with embrace callback

---

## Additional Notes

- The baseline migration will mark all existing tables as "applied" in Prisma's migration history
- Future schema changes will require creating new migrations
- The server now properly handles Railway's dynamic port allocation
- Health check endpoint `/api/protected` is configured for Railway

