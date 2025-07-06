const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const UserController = require("../controllers/user.controller");
const uploadAvatar = require("../middleware/uploadAvatar.middleware");

// Get all users
router.get("/", auth, UserController.getAllUsers);

// Get all users with project statistics
router.get(
    "/with-project-stats",
    auth,
    UserController.getAllUsersWithProjectStats
);

// Search and filter users
router.get("/search", auth, UserController.searchUsers);

// Get user statistics
router.get("/stats", auth, authorize(["admin"]), UserController.getUserStats);

// Get users by department
router.get(
    "/department/:departmentId",
    auth,
    UserController.getUsersByDepartment
);

// Bulk update users
router.put("/bulk", auth, authorize(["admin"]), UserController.bulkUpdateUsers);

// Bulk delete users
router.delete(
    "/bulk",
    auth,
    authorize(["admin"]),
    UserController.bulkDeleteUsers
);

// Get user notifications
router.get("/notifications", auth, UserController.getUserNotifications);

// Mark notification as read
router.put(
    "/notifications/:notificationId",
    auth,
    UserController.markNotificationAsRead
);

// Get user tasks
router.get("/tasks", auth, UserController.getUserTasks);

// Get user projects
router.get("/projects", auth, UserController.getUserProjects);

// Get user by ID
router.get("/:id", auth, UserController.getUserById);

// Create new user
router.post("/", auth, authorize(["admin"]), UserController.createUser);

// Update user
router.put("/:id", auth, authorize(["admin"]), UserController.updateUser);

// Delete user
router.delete("/:id", auth, authorize(["admin"]), UserController.deleteUser);

// Upload avatar
router.put(
    "/:id/avatar",
    auth,
    authorize(["admin"]),
    uploadAvatar.single("avatar"),
    UserController.uploadAvatar
);

module.exports = router;
