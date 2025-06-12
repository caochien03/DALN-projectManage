const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/task.controller");
const auth = require("../middleware/auth");

// Create a new task
router.post("/", auth, TaskController.createTask);

// Get all tasks
router.get("/", auth, TaskController.getAllTasks);

// Get task by ID
router.get("/:id", auth, TaskController.getTaskById);

// Get tasks by project
router.get("/project/:projectId", auth, TaskController.getTasksByProject);

// Update task
router.put("/:id", auth, TaskController.updateTask);

// Add comment to task
router.post("/:id/comments", auth, TaskController.addComment);

// Get overdue tasks
router.get("/overdue", auth, TaskController.getOverdueTasks);

// Get tasks by status
router.get("/status/:status", auth, TaskController.getTasksByStatus);

// Delete task
router.delete("/:id", auth, TaskController.deleteTask);

module.exports = router;
