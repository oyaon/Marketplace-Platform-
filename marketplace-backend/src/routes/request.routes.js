const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  requestProject,
  getProjectRequests,
  assignSolver,
} = require("../controllers/request.controller");

const router = express.Router();

// Buyer assigns solver - MUST come before /:projectId to avoid route conflict
router.post("/assign", auth, role(["BUYER"]), assignSolver);

// Solver requests project - Changed from /:projectId to / with body
router.post("/", auth, role(["SOLVER"]), requestProject);

// Buyer views requests
router.get("/:projectId", auth, role(["BUYER"]), getProjectRequests);

module.exports = router;

