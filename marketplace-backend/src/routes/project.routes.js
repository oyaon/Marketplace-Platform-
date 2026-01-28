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
  getAssignedProjects,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

// Buyer
router.post("/", auth, role(["BUYER"]), createProject);
router.get("/", auth, role(["BUYER"]), getMyProjects);

// Buyer update/delete own project
router.patch("/:id", auth, role(["BUYER"]), updateProject);
router.delete("/:id", auth, role(["BUYER"]), deleteProject);

// Get project details with tasks, requests, solver info
router.get("/:id/details", auth, getProjectDetails);

// Get project by ID
router.get("/:id", auth, getProjectById);

// Admin
router.get("/all", auth, role(["ADMIN"]), getAllProjects);

// Solver
router.get("/open", auth, role(["SOLVER"]), getOpenProjects);

// Solver - get assigned projects
router.get("/assigned/me", auth, role(["SOLVER"]), getAssignedProjects);

module.exports = router;

