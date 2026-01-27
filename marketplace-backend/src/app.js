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

app.use(cors());
app.use(express.json());

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
  res.json({ message: "API running" });
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
