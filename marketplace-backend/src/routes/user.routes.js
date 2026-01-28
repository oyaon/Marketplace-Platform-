const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  getMe,
  assignBuyerRole,
  getAllUsers,
} = require("../controllers/user.controller");

const router = express.Router();

// Get current user profile
router.get("/me", auth, getMe);

// Get all users (Admin only)
router.get("/", auth, role(["ADMIN"]), getAllUsers);

// Assign buyer role (Admin only)
router.patch("/:userId/assign-buyer", auth, role(["ADMIN"]), assignBuyerRole);

module.exports = router;

