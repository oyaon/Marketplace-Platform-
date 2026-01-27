# Marketplace API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/*`) require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📝 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "SOLVER" // Optional: ADMIN, BUYER, or SOLVER (default: SOLVER)
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "SOLVER"
  }
}
```

---

### Login User
```http
POST /auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "SOLVER"
  }
}
```

---

## 👥 User Management Endpoints

### Get All Users (ADMIN only)
```http
GET /users
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "SOLVER"
  }
]
```

---

### Assign Buyer Role (ADMIN only)
```http
PATCH /users/:userId/assign-buyer
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "message": "Buyer role assigned",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "BUYER"
  }
}
```

---

## 📦 Project Endpoints

### Create Project (BUYER only)
```http
POST /projects
Authorization: Bearer <buyer_token>
```

**Request:**
```json
{
  "title": "Build a Website",
  "description": "Create a responsive website for my business"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "Build a Website",
  "description": "Create a responsive website for my business",
  "status": "UNASSIGNED",
  "buyerId": "uuid",
  "createdAt": "2026-01-28T10:00:00Z",
  "updatedAt": "2026-01-28T10:00:00Z"
}
```

---

### Get My Projects (BUYER only)
```http
GET /projects
Authorization: Bearer <buyer_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "Build a Website",
    "status": "ASSIGNED",
    "_count": {
      "tasks": 3,
      "requests": 5
    },
    "createdAt": "2026-01-28T10:00:00Z"
  }
]
```

---

### Get All Projects (ADMIN only)
```http
GET /projects/all
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "Build a Website",
    "status": "ASSIGNED",
    "buyer": {
      "id": "uuid",
      "email": "buyer@example.com"
    },
    "_count": {
      "tasks": 3,
      "requests": 5
    },
    "createdAt": "2026-01-28T10:00:00Z"
  }
]
```

---

### Get Open Projects (SOLVER only)
```http
GET /projects/open
Authorization: Bearer <solver_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "Build a Website",
    "description": "Create a responsive website",
    "status": "UNASSIGNED",
    "buyer": {
      "email": "buyer@example.com"
    },
    "_count": {
      "tasks": 0
    },
    "createdAt": "2026-01-28T10:00:00Z"
  }
]
```

---

### Get Project by ID
```http
GET /projects/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Build a Website",
  "status": "ASSIGNED",
  "buyer": {
    "id": "uuid",
    "email": "buyer@example.com"
  },
  "_count": {
    "tasks": 3,
    "requests": 5
  }
}
```

---

### Get Project Details (includes tasks, requests, solver info)
```http
GET /projects/:id/details
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Build a Website",
  "description": "...",
  "status": "ASSIGNED",
  "buyer": {
    "id": "uuid",
    "email": "buyer@example.com"
  },
  "tasks": [
    {
      "id": "uuid",
      "title": "Design Homepage",
      "status": "SUBMITTED",
      "deadline": "2026-02-04T00:00:00Z",
      "submission": {
        "fileUrl": "uploads/task_1234.zip"
      }
    }
  ],
  "requests": [
    {
      "id": "uuid",
      "status": "ACCEPTED",
      "solver": {
        "id": "uuid",
        "email": "solver@example.com"
      }
    }
  ]
}
```

---

## 🤝 Request Endpoints

### Request a Project (SOLVER only)
```http
POST /requests
Authorization: Bearer <solver_token>
```

**Request:**
```json
{
  "projectId": "uuid"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "solverId": "uuid",
  "status": "PENDING"
}
```

**Errors:**
- `409 Conflict`: Already requested this project
- `409 Conflict`: Project is already assigned

---

### Get Project Requests (BUYER only)
```http
GET /requests/:projectId
Authorization: Bearer <buyer_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "status": "PENDING",
    "solver": {
      "id": "uuid",
      "email": "solver@example.com"
    },
    "createdAt": "2026-01-28T10:00:00Z"
  }
]
```

---

### Assign Solver to Project (BUYER only)
```http
POST /requests/assign
Authorization: Bearer <buyer_token>
```

**Request:**
```json
{
  "projectId": "uuid",
  "solverId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "message": "Solver assigned successfully",
  "project": {
    "id": "uuid",
    "status": "ASSIGNED",
    "assignedSolverId": "uuid"
  }
}
```

**Important:**
- Project transitions from `UNASSIGNED` → `ASSIGNED`
- **Cannot reassign** (409 Conflict if already assigned)
- Other requests auto-rejected
- Chosen request marked as ACCEPTED

---

## ✅ Task Endpoints

### Get Tasks by Project (SOLVER and BUYER)
```http
GET /tasks/:projectId
Authorization: Bearer <token>
```

**Authorization:**
- SOLVER: Can only view if assigned to project
- BUYER: Can only view their own projects

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Design Homepage",
    "description": "Create a modern, responsive homepage",
    "status": "SUBMITTED",
    "deadline": "2026-02-04T00:00:00Z",
    "submission": {
      "id": "uuid",
      "fileUrl": "uploads/task_uuid.zip",
      "submittedAt": "2026-01-30T15:00:00Z"
    },
    "createdAt": "2026-01-28T10:00:00Z"
  }
]
```

---

### Create Task (SOLVER only)
```http
POST /tasks/:projectId
Authorization: Bearer <solver_token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Design Homepage",
  "description": "Create a modern, responsive homepage",
  "deadline": "2026-02-04T00:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "title": "Design Homepage",
  "status": "IN_PROGRESS",
  "deadline": "2026-02-04T00:00:00Z",
  "createdAt": "2026-01-28T10:00:00Z"
}
```

**Errors:**
- `403 Forbidden`: Not assigned to this project
- `400 Bad Request`: Deadline must be in the future

---

### Submit Task with ZIP (SOLVER only)
```http
POST /tasks/submit/:taskId
Authorization: Bearer <solver_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: ZIP file (required)

**Response (200 OK):**
```json
{
  "message": "Task submitted successfully",
  "submission": {
    "id": "uuid",
    "taskId": "uuid",
    "fileUrl": "uploads/task_uuid.zip",
    "submittedAt": "2026-01-30T15:00:00Z"
  }
}
```

**Task transitions:** `IN_PROGRESS` → `SUBMITTED`

**Errors:**
- `403 Forbidden`: Not assigned to this task
- `409 Conflict`: Task already submitted
- `409 Conflict`: Cannot submit task in [status] state

---

### Accept Task (BUYER only)
```http
POST /tasks/accept/:taskId
Authorization: Bearer <buyer_token>
```

**Response (200 OK):**
```json
{
  "message": "Task accepted successfully",
  "task": {
    "id": "uuid",
    "status": "COMPLETED",
    "updatedAt": "2026-01-30T16:00:00Z"
  }
}
```

**Task transitions:** `SUBMITTED` → `COMPLETED`

**Errors:**
- `403 Forbidden`: Not your project
- `409 Conflict`: Task must be in SUBMITTED status

---

### Get Task Submission (BUYER only)
```http
GET /tasks/:taskId/submission
Authorization: Bearer <buyer_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Design Homepage",
  "status": "SUBMITTED",
  "submission": {
    "fileUrl": "uploads/task_uuid.zip",
    "submittedAt": "2026-01-30T15:00:00Z"
  }
}
```

---

## State Diagrams

### Project Lifecycle
```
UNASSIGNED ──assign──> ASSIGNED
  │
  └─ (cannot reassign)
```

### Task Lifecycle
```
IN_PROGRESS ──submit──> SUBMITTED ──accept──> COMPLETED
  │                         │
  └─ (cannot skip submit)    └─ (must be SUBMITTED)
```

### Request Lifecycle
```
PENDING ──assign──> ACCEPTED  (or)  REJECTED
         ──ignore──>
```

---

## Error Handling

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "Additional details (if available)"
}
```

### Common Status Codes
- `200 OK`: Successful GET, POST, or PATCH
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Invalid state transition
- `500 Internal Server Error`: Server error

---

## Role-Based Access Control

| Endpoint | ADMIN | BUYER | SOLVER |
|----------|-------|-------|--------|
| POST /projects | ❌ | ✅ | ❌ |
| GET /projects | ❌ | ✅ | ❌ |
| GET /projects/all | ✅ | ❌ | ❌ |
| GET /projects/open | ❌ | ❌ | ✅ |
| POST /requests | ❌ | ❌ | ✅ |
| GET /requests/:id | ❌ | ✅ | ❌ |
| POST /requests/assign | ❌ | ✅ | ❌ |
| GET /tasks/:id | ❌ | ✅ | ✅ |
| POST /tasks/:id | ❌ | ❌ | ✅ |
| POST /tasks/submit/:id | ❌ | ❌ | ✅ |
| POST /tasks/accept/:id | ❌ | ✅ | ❌ |
| GET /users | ✅ | ❌ | ❌ |
| PATCH /users/:id/assign-buyer | ✅ | ❌ | ❌ |

