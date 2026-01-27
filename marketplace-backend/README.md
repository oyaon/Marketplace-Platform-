# Marketplace Backend API

A RESTful API for a marketplace platform connecting Buyers with Solvers for project collaboration.

## Quick Overview

**Workflow:** Admin assigns Buyers → Buyer creates Project → Solver requests → Buyer assigns Solver → Solver creates Tasks → Solver submits ZIP → Buyer accepts → Project complete.

**Tech Stack:** Node.js/Express, PostgreSQL, JWT Authentication

**Key Features:**
- ✅ Role-based access control (ADMIN/BUYER/SOLVER)
- ✅ Server-enforced state transitions (no skipping)
- ✅ ZIP-based task submissions
- ✅ Input validation & clear error handling
- ✅ 12 integration tests (full workflow coverage)
- ✅ Complete API documentation
- ✅ Production-ready (tested, documented, deployable)

## System Overview

This backend system manages a marketplace where:
- **Buyers** can post projects and hire Solvers
- **Solvers** can browse and request unassigned projects
- **Admins** can manage users and assign Buyer roles

## Role Hierarchy

```
ADMIN (Highest privileges)
├── View all users
├── Assign BUYER role to any user
├── View all projects
└── No direct execution actions

BUYER
├── Create projects
├── View solver requests for their projects
├── Assign ONE solver to a project
├── Review submissions
└── Accept completed tasks

SOLVER (Most restricted)
├── Browse only UNASSIGNED projects
├── Request to work on projects
├── Create tasks (after assignment)
└── Submit ZIP files only
```

## Project Lifecycle

```
1. PROJECT CREATION
   Buyer creates project → Status: UNASSIGNED
   
2. SOLVER REQUEST
   Solver views UNASSIGNED projects → Submits request → Status: PENDING
   
3. SOLVER ASSIGNMENT
   Buyer selects solver → Status: ASSIGNED
   - Chosen request → ACCEPTED
   - Other requests → REJECTED
   
4. TASK MANAGEMENT
   Solver creates tasks → Status: IN_PROGRESS
   
5. SUBMISSION
   Solver submits ZIP → Status: SUBMITTED
   
6. COMPLETION
   Buyer accepts submission → Status: COMPLETED
```

## State Transitions

### Project
| From | To | Trigger |
|------|-----|---------|
| UNASSIGNED | ASSIGNED | Buyer assigns solver |
| (No transition back) | | |

### Request
| From | To | Trigger |
|------|-----|---------|
| PENDING | ACCEPTED | Buyer selects solver |
| PENDING | REJECTED | Buyer selects different solver |
| (No transition back) | | |

### Task
| From | To | Trigger |
|------|-----|---------|
| IN_PROGRESS | SUBMITTED | Solver uploads ZIP |
| SUBMITTED | COMPLETED | Buyer accepts submission |
| (No skipping states) | | |

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer (ZIP files only)
- **Password Hashing**: Bcryptjs

## Why PostgreSQL?

PostgreSQL was chosen for:
1. **Relational data integrity**: Complex relationships between Users, Projects, Requests, Tasks, and Submissions are naturally modeled
2. **ACID compliance**: Critical for financial/transactional operations
3. **Strong typing with enums**: Ensures data consistency for status fields
4. **Mature ecosystem**: Excellent Prisma integration and production stability

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or remote)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd marketplace-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npx prisma db push
npx prisma generate

# Start the server
npm start
```

### Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

## API Route Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login and get JWT |

### Users (`/api/users`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | Get all users |
| PATCH | `/:userId/assign-buyer` | Admin | Assign BUYER role |

### Projects (`/api/projects`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/` | Buyer | Create project |
| GET | `/all` | Admin | View all projects |
| GET | `/open` | Solver | View unassigned projects |

### Requests (`/api/requests`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/assign` | Buyer | Assign solver to project |
| GET | `/:projectId` | Buyer | View project requests |
| POST | `/:projectId` | Solver | Request to work on project |

### Tasks (`/api/tasks`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/:projectId` | Solver | Create task |
| POST | `/submit/:taskId` | Solver | Submit ZIP file |
| POST | `/accept/:taskId` | Buyer | Accept submission |

## Key Architectural Decisions

### 1. Role-Based Access Control (RBAC)
Middleware-based approach where each route declares allowed roles. Simple, effective, and scales well.

### 2. State Machine for Workflow
Projects, Requests, and Tasks follow strict state transitions with guards preventing invalid states.

### 3. One-to-One Submission Model
Each Task has exactly one Submission, preventing multiple acceptance conflicts.

### 4. RESTful URL Design
Clean URL structure with proper HTTP methods and status codes.

### 5. Request Status Automation
When a solver is assigned:
- Their request → ACCEPTED
- All other requests → REJECTED
This ensures clean state management.

## Running the Application

```bash
# Development with auto-restart
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## Deployment

- **Backend:** Deployed on Railway
- **Frontend:** Deployed on Vercel
- **Database:** PostgreSQL (Neon)
- **API Docs:** See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

## Testing

```bash
# Run integration tests
node tests/integration.test.js

# Tests cover: registration, login, project creation, requests, assignment, 
# task creation, submission, acceptance, and state transition verification
```

## Documentation

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete endpoint reference (19 endpoints)
- **[../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Production deployment
- **[../QUICK_START_GUIDE.md](../QUICK_START_GUIDE.md)** - Local development setup

## Database Schema

```
User
├── id, name, email, password, role (ADMIN/BUYER/SOLVER)
├── projects (as Buyer)
└── requests (as Solver)

Project
├── id, title, description, status (UNASSIGNED/ASSIGNED)
├── buyerId → User
├── assignedSolverId (nullable)
├── tasks[]
└── requests[]

Request
├── id, projectId, solverId, status (PENDING/ACCEPTED/REJECTED)
├── projectId → Project
└── solverId → User

Task
├── id, projectId, title, description, deadline, status (IN_PROGRESS/SUBMITTED/COMPLETED)
├── projectId → Project
└── submission (1:1)

Submission
├── id, taskId, fileUrl, submittedAt
└── taskId → Task (unique)
```

## Error Handling

All errors return JSON responses:
```json
{
  "message": "Error description"
}
```

Status codes used:
- `400` - Bad Request (validation)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (role not allowed)
- `404` - Not Found
- `409` - Conflict (e.g., already assigned)
- `500` - Server Error

