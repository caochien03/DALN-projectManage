const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/project.controller");
const auth = require("../middleware/auth");

// Create a new project
router.post("/", auth, ProjectController.createProject);

// Get all projects
router.get("/", auth, ProjectController.getAllProjects);

// Get project by ID
router.get("/:id", auth, ProjectController.getProjectById);

// Update project
router.put("/:id", auth, ProjectController.updateProject);

// Add member to project
router.post("/:id/members", auth, ProjectController.addMember);

// Remove member from project
router.delete("/:id/members/:memberId", auth, ProjectController.removeMember);

// Get project progress
router.get("/:id/progress", auth, ProjectController.getProjectProgress);

// Delete project
router.delete("/:id", auth, ProjectController.deleteProject);

// Đăng ký tham gia dự án
router.post("/:id/register", auth, ProjectController.registerForProject);

// Duyệt nhân viên tham gia dự án
router.post("/:id/approve/:userId", auth, ProjectController.approveMember);

// Từ chối nhân viên tham gia dự án
router.post("/:id/reject/:userId", auth, ProjectController.rejectMember);

// Complete project
router.put("/:id/complete", auth, ProjectController.completeProject);

// Complete milestone
router.put(
    "/:id/milestones/:milestoneId/complete",
    auth,
    ProjectController.completeMilestone
);

// Check milestone consistency
router.get(
    "/:id/milestones/:milestoneId/check-consistency",
    auth,
    ProjectController.checkMilestoneConsistency
);

module.exports = router;
