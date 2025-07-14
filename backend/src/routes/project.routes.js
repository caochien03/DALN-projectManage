const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/project.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Create a new project
router.post(
    "/",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.createProject
);

// Get all projects
router.get("/", auth, ProjectController.getAllProjects);

// Get project by ID
router.get("/:id", auth, ProjectController.getProjectById);

// Update project
router.put(
    "/:id",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.updateProject
);

// Add member to project
router.post(
    "/:id/members",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.addMember
);

// Remove member from project
router.delete(
    "/:id/members/:memberId",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.removeMember
);

// Get project progress
router.get("/:id/progress", auth, ProjectController.getProjectProgress);

// Delete project
router.delete(
    "/:id",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.deleteProject
);

// Đăng ký tham gia dự án
router.post("/:id/register", auth, ProjectController.registerForProject);

// Duyệt nhân viên tham gia dự án
router.post(
    "/:id/approve/:userId",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.approveMember
);

// Từ chối nhân viên tham gia dự án
router.post(
    "/:id/reject/:userId",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.rejectMember
);

// Complete project
router.put(
    "/:id/complete",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.completeProject
);

// Complete milestone
router.put(
    "/:id/milestones/:milestoneId/complete",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.completeMilestone
);

// Check milestone consistency
router.get(
    "/:id/milestones/:milestoneId/check-consistency",
    auth,
    ProjectController.checkMilestoneConsistency
);

// Tạo milestone mới
router.post(
    "/:id/milestones",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.createMilestone
);

// Cập nhật milestone
router.put(
    "/:id/milestones/:milestoneId",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.updateMilestone
);

// Xóa milestone
router.delete(
    "/:id/milestones/:milestoneId",
    auth,
    authorize(["admin", "manager"]),
    ProjectController.deleteMilestone
);

// Get project activity log
router.get("/:id/activity", auth, ProjectController.getProjectActivity);

module.exports = router;
