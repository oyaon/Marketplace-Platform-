const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  assignBuyerRole,
  getAllUsers,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/", auth, role(["ADMIN"]), getAllUsers);
router.patch("/:userId/assign-buyer", auth, role(["ADMIN"]), assignBuyerRole);

module.exports = router;

