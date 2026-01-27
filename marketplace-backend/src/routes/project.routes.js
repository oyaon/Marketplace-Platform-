const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  createProject,
  getMyProjects,
  getAllProjects,
  getOpenProjects,
  getProjectById,
  getProjectDetails,
} = require("../controllers/project.controller");

const router = express.Router();

// Buyer
router.post("/", auth, role(["BUYER"]), createProject);
router.get("/", auth, role(["BUYER"]), getMyProjects);

// Get project details with tasks, requests, solver info
router.get("/:id/details", auth, getProjectDetails);

// Get project by ID
router.get("/:id", auth, getProjectById);

// Admin
router.get("/all", auth, role(["ADMIN"]), getAllProjects);

// Solver
router.get("/open", auth, role(["SOLVER"]), getOpenProjects);

module.exports = router;

