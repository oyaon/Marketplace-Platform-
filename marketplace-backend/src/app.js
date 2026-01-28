console.log("[APP.JS] app.js is loading");

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const requestRoutes = require("./routes/request.routes");
const taskRoutes = require("./routes/task.routes");
const authMiddleware = require("./middleware/auth");

const app = express();

// CORS configuration - allows frontend from environment variable or development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:3000', // development
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// Health check endpoint (no authentication required for Railway)
const prisma = require("./config/prisma");

app.get("/health", async (req, res) => {
  try {
    // Test database connection using existing prisma instance
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: "unhealthy", error: error.message });
  }
});

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

try {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/requests", requestRoutes);
  app.use("/api/tasks", taskRoutes);
} catch (err) {
  console.error("[APP] ERROR mounting routes:", err.message);
}

app.get("/", (req, res) => {
  res.json({ 
    message: "Marketplace API running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      projects: "/api/projects",
      requests: "/api/requests",
      tasks: "/api/tasks",
      docs: "/api-docs (see API_DOCUMENTATION.md)"
    }
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "Marketplace API v1",
    documentation: "See API_DOCUMENTATION.md",
    endpoints: {
      auth: "/api/auth/register, /api/auth/login",
      users: "/api/users (ADMIN), /api/users/:id/assign-buyer (ADMIN)",
      projects: "/api/projects, /api/projects/open (SOLVER), /api/projects/all (ADMIN)",
      requests: "/api/requests, /api/requests/:projectId, /api/requests/assign",
      tasks: "/api/tasks/:projectId, /api/tasks/submit/:id, /api/tasks/accept/:id"
    }
  });
});

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR HANDLER] Error caught!");
  console.error("[ERROR HANDLER] Error:", err);
  console.error("[ERROR HANDLER] Message:", err.message);
  console.error("[ERROR HANDLER] Stack:", err.stack);
  res.status(err.status || 500).json({ message: "Server error", error: err.message });
});

module.exports = app;
