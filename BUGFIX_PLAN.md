# Bug Fix Implementation Plan

## Critical Bugs to Fix

### 1. Prisma Schema - Missing User Relation
**File**: `marketplace-backend/prisma/schema.prisma`
- Add `assignedProjects Project[] @relation("SolverProjects")` to User model
- Add `solver User? @relation("SolverProjects", fields: [assignedSolverId], references: [id])` to Project model
- Add COMPLETED status to ProjectStatus enum

### 2. Missing API Endpoints
**File**: `marketplace-backend/src/routes/user.routes.js`
- Add `GET /me` endpoint to get current user profile

**File**: `marketplace-backend/src/controllers/user.controller.js`
- Add `getMe` function

**File**: `marketplace-backend/src/routes/project.routes.js`
- Add `GET /assigned` endpoint for solvers to get their assigned projects
- Add `PATCH /:id` update project endpoint
- Add `DELETE /:id` delete project endpoint

**File**: `marketplace-backend/src/controllers/project.controller.js`
- Add `getAssignedProjects` function
- Add `updateProject` function
- Add `deleteProject` function

### 3. Frontend Hardcoded URLs
**Files**: 
- `marketplace-frontend/src/app/buyer/page.tsx`
- `marketplace-frontend/src/app/solver/page.tsx`
- Replace hardcoded `http://localhost:5000` with `apiFetch` or proper API_URL

### 4. Admin Dashboard
**File**: `marketplace-frontend/src/app/admin/page.tsx`
- Add user management UI with list of users and ability to assign buyer role

### 5. Logout UI
**Files**:
- Add logout button to all dashboard pages
- `buyer/page.tsx`, `solver/page.tsx`, `admin/page.tsx`

### 6. Upload Directory
**File**: `marketplace-backend/.gitignore`
- Add `src/uploads/` to .gitignore

### 7. Create uploads directory on startup
**File**: `marketplace-backend/src/server.js`
- Add code to create uploads directory if it doesn't exist

## Execution Order
1. Fix Prisma schema
2. Add missing API endpoints
3. Fix frontend hardcoded URLs
4. Create Admin dashboard UI
5. Add logout buttons
6. Fix .gitignore and uploads directory handling

