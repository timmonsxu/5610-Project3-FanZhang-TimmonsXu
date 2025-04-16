const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/rankings", userController.getUserRankings);

// Protected routes
router.get("/me", auth, userController.getCurrentUser);

module.exports = router;
