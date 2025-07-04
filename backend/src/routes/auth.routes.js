const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const uploadAvatar = require("../middleware/uploadAvatar.middleware");

// Public routes
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Protected routes
router.get("/me", auth, AuthController.getCurrentUser);
router.put("/profile", auth, AuthController.updateProfile);
router.put("/password", auth, AuthController.changePassword);
router.put(
    "/profile/avatar",
    auth,
    uploadAvatar.single("avatar"),
    AuthController.uploadAvatar
);

module.exports = router;
