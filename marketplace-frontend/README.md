# Marketplace Frontend

Role-based dashboard UI for a project marketplace connecting Buyers and Solvers.

## Quick Overview

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion

**Features:**
- ✅ Admin dashboard (user management)
- ✅ Buyer dashboard (project management)
- ✅ Solver dashboard (project browsing)
- ✅ Animated state transitions
- ✅ Role-based routing with middleware
- ✅ JWT authentication
- ✅ Fully responsive design

## Getting Started

Run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

### Admin Dashboard (`/admin`)
- View all users with their roles
- Assign Buyer role to users
- Browse all projects with status tracking

### Buyer Dashboard (`/buyer`)
- Create new projects
- View all projects you've created
- Manage project assignments and tasks
- Accept/review solver submissions

### Solver Dashboard (`/solver`)
- Browse available (unassigned) projects
- Request to work on projects
- Create tasks after assignment
- Submit ZIP files for tasks
- View submission status

## Configuration

Backend API URL:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production deployment, update to your production backend URL.

## Deployment

Deployed on Vercel. Push to `main` branch for auto-deployment.

## Documentation

- **Backend API:** See [../marketplace-backend/API_DOCUMENTATION.md](../marketplace-backend/API_DOCUMENTATION.md)
- **Local Setup:** See [../QUICK_START_GUIDE.md](../QUICK_START_GUIDE.md)
- **Deployment:** See [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

## Technology Stack

This is a [Next.js](https://nextjs.org) project with:
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [React 19](https://react.dev)



This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
