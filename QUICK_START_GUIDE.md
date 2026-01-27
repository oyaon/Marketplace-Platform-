# Quick Start Guide

## 📋 Prerequisites
- Node.js 18+
- PostgreSQL (locally or via Neon)
- Git

---

## 🚀 Local Development (5 minutes)

### 1. Clone & Setup Backend
```bash
cd marketplace-backend

# Install dependencies
npm install

# Create .env file
echo 'JWT_SECRET=dev-secret-key
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace' > .env

# Create PostgreSQL database
createdb marketplace

# Run migrations
npx prisma migrate dev --name init

# Start backend
npm run dev
```

Backend running at: `http://localhost:5000`

### 2. Clone & Setup Frontend
```bash
cd marketplace-frontend

# Install dependencies
npm install

# Create .env.local file
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000' > .env.local

# Start frontend
npm run dev
```

Frontend running at: `http://localhost:3000`

---

## 🧪 Test the Workflow (10 minutes)

### Create Test Users

**Option A: Via API (using curl)**
```bash
# Register Admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "password123",
    "role": "ADMIN"
  }'

# Register Buyer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buyer User",
    "email": "buyer@test.com",
    "password": "password123",
    "role": "BUYER"
  }'

# Register Solver
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Solver User",
    "email": "solver@test.com",
    "password": "password123",
    "role": "SOLVER"
  }'
```

**Option B: Via Frontend**
1. Go to `http://localhost:3000/register`
2. Create admin account (role selector on registration)
3. Repeat for buyer and solver accounts

### Test the Complete Flow

1. **Login as Buyer** → Create Project → View Dashboard
2. **Login as Solver** → Browse Projects → Request Project
3. **Login as Buyer** → Accept Request → Assign Solver
4. **Login as Solver** → Create Task → Submit ZIP
5. **Login as Buyer** → Accept Task → View Completion

---

## 📁 Project Structure

```
marketplace-backend/
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Entry point
│   ├── controllers/           # Business logic
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth, role checking
│   └── config/                # Database config
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── tests/
│   └── integration.test.js    # Test suite
└── API_DOCUMENTATION.md       # API reference

marketplace-frontend/
├── src/
│   ├── app/
│   │   ├── admin/page.tsx     # Admin dashboard
│   │   ├── buyer/page.tsx     # Buyer dashboard
│   │   ├── solver/page.tsx    # Solver dashboard
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities & API client
│   └── middleware.ts          # Role-based routing
└── package.json
```

---

## 🔑 Key Endpoints

### Authentication
```bash
POST /api/auth/register    # Create account
POST /api/auth/login       # Get JWT token
```

### Projects
```bash
POST   /api/projects                # Buyer: Create
GET    /api/projects                # Buyer: View own
GET    /api/projects/open           # Solver: Browse
GET    /api/projects/all            # Admin: View all
GET    /api/projects/:id/details    # Get with tasks & requests
```

### Requests
```bash
POST   /api/requests/:projectId     # Solver: Request
GET    /api/requests/:projectId     # Buyer: View requests
POST   /api/requests/assign         # Buyer: Assign solver
```

### Tasks
```bash
GET    /api/tasks/:projectId        # View tasks
POST   /api/tasks/:projectId        # Solver: Create task
POST   /api/tasks/submit/:taskId    # Solver: Submit ZIP
POST   /api/tasks/accept/:taskId    # Buyer: Accept task
```

---

## 🔑 Default Test Credentials

```
Admin:
  Email: admin@test.com
  Password: password123

Buyer:
  Email: buyer@test.com
  Password: password123

Solver:
  Email: solver@test.com
  Password: password123
```

---

## 📖 Documentation

- **API Reference**: See `API_DOCUMENTATION.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Full Audit Report**: See `AUDIT_AND_IMPLEMENTATION_REPORT.md`

---

## 🐛 Debugging

### Backend Logs
```bash
npm run dev
# Logs all requests and errors
```

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View database
npx prisma studio
```

### Frontend Console
- Open DevTools (F12)
- Check Console for errors
- Check Network tab for API calls

---

## 🧪 Run Tests

```bash
cd marketplace-backend

# Run integration test suite
node tests/integration.test.js

# Should output:
# ✅ Register Users
# ✅ Login and Get Tokens
# ✅ Admin: View All Users
# ... (all tests pass)
# ✅ All tests passed!
```

---

## 🚀 Production Deployment

When ready to deploy:

1. **Follow**: `DEPLOYMENT_GUIDE.md`
2. **Push code**: `git push origin main`
3. **Deploy**: Railway + Vercel auto-deploy
4. **Update frontend**: Set `NEXT_PUBLIC_API_URL` to production backend URL

---

## ❓ Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Check environment variables
cat .env

# Ensure database exists
psql -l
```

### Frontend won't load
```bash
# Clear cache
rm -rf .next node_modules/.cache

# Rebuild
npm run build

# Check API URL
echo $NEXT_PUBLIC_API_URL
```

### Database connection fails
```bash
# Test connection
psql $DATABASE_URL

# Ensure PostgreSQL is running
pg_isready
```

### API returns 401 (Unauthorized)
- Ensure token is being sent: `Authorization: Bearer <token>`
- Token may have expired (expires in 1 day)
- Re-login to get new token

---

## 📞 Support Resources

- **Backend issues**: Check `src/app.js` console logs
- **Database issues**: Use `npx prisma studio`
- **API issues**: Refer to `API_DOCUMENTATION.md`
- **Deployment issues**: See `DEPLOYMENT_GUIDE.md`

---

## ✅ Checklist Before First Deploy

- [ ] Backend runs locally on port 5000
- [ ] Frontend runs locally on port 3000
- [ ] Can create accounts and login
- [ ] Can create project as buyer
- [ ] Can request project as solver
- [ ] Can assign solver as buyer
- [ ] All tests pass: `node tests/integration.test.js`
- [ ] `.env` files created (not in git)
- [ ] Database migrations applied: `npx prisma migrate deploy`

---

## 🎓 Next Steps

1. **Understand the API**: Read `API_DOCUMENTATION.md`
2. **Review the workflow**: Check `AUDIT_AND_IMPLEMENTATION_REPORT.md`
3. **Deploy to production**: Follow `DEPLOYMENT_GUIDE.md`
4. **Monitor & scale**: Set up logging and monitoring

---

## 🎉 You're All Set!

Your marketplace is ready to use. Start by logging in and following the workflow:
1. Create a buyer account
2. Create a solver account
3. Create a project as buyer
4. Request as solver
5. Assign as buyer
6. Complete workflow

Enjoy! 🚀

