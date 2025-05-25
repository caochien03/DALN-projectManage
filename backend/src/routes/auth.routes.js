const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// Public routes
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Protected routes
router.get("/me", auth, AuthController.getCurrentUser);
router.patch("/profile", auth, AuthController.updateProfile);
router.patch("/password", auth, AuthController.changePassword);

module.exports = router;
