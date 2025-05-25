const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const Department = require("../models/Department");

// Get dashboard statistics
router.get("/", auth, async (req, res) => {
    try {
        const [totalProjects, totalTasks, totalUsers, totalDepartments] =
            await Promise.all([
                Project.countDocuments(),
                Task.countDocuments(),
                User.countDocuments(),
                Department.countDocuments(),
            ]);

        res.json({
            totalProjects,
            totalTasks,
            totalUsers,
            totalDepartments,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get recent activities
router.get("/activities", auth, async (req, res) => {
    try {
        const recentProjects = await Project.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name createdAt");

        const recentTasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title status createdAt");

        res.json({
            recentProjects,
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get task statistics
router.get("/tasks", auth, async (req, res) => {
    try {
        const taskStats = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json(taskStats);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get project statistics
router.get("/projects", auth, async (req, res) => {
    try {
        const projectStats = await Project.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json(projectStats);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get department statistics
router.get("/departments", auth, async (req, res) => {
    try {
        const departmentStats = await Department.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "department",
                    as: "members",
                },
            },
            {
                $project: {
                    name: 1,
                    memberCount: { $size: "$members" },
                },
            },
        ]);

        res.json(departmentStats);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
