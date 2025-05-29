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
router.patch("/:id", auth, ProjectController.updateProject);

// Add member to project
router.post("/:id/members", auth, ProjectController.addMember);

// Remove member from project
router.delete("/:id/members/:memberId", auth, ProjectController.removeMember);

// Get project progress
router.get("/:id/progress", auth, ProjectController.getProjectProgress);

// Delete project
router.delete("/:id", auth, ProjectController.deleteProject);

module.exports = router;
