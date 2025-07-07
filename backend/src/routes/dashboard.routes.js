const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth");

// Apply authentication middleware to all dashboard routes
router.use(auth);

// Get all dashboard data in one request (main dashboard)
router.get("/", DashboardController.getAllDashboardData);

// Get overall statistics
router.get("/stats", DashboardController.getOverallStats);

// Get recent activities
router.get("/activities", DashboardController.getRecentActivities);

// Get projects near deadline
router.get(
    "/projects-near-deadline",
    DashboardController.getProjectsNearDeadline
);

// Get department statistics
router.get("/department-stats", DashboardController.getDepartmentStats);

// Get user performance statistics
router.get("/user-performance", DashboardController.getUserPerformanceStats);

module.exports = router;
