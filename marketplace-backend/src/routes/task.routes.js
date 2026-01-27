const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const upload = require("../middleware/upload");
const {
  getTasksByProject,
  createTask,
  submitTask,
  acceptTask,
  getTaskSubmission,
} = require("../controllers/task.controller");

const router = express.Router();

// Get tasks by project (Solver and Buyer can access)
router.get("/:projectId", auth, role(["SOLVER", "BUYER"]), getTasksByProject);

// Get task submission details (Buyer only)
router.get("/:taskId/submission", auth, role(["BUYER"]), getTaskSubmission);

// Solver creates task
router.post("/:projectId", auth, role(["SOLVER"]), createTask);

// Solver submits ZIP
router.post("/submit/:taskId", auth, role(["SOLVER"]), upload.single("file"), submitTask);

// Buyer accepts task
router.post("/accept/:taskId", auth, role(["BUYER"]), acceptTask);

module.exports = router;
