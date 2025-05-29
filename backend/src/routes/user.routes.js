const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get all users
router.get("/", auth, async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("department", "name");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
router.get("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user
router.post("/", auth, async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user
router.patch("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        Object.assign(user, req.body);
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete user
router.delete("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await user.remove();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user notifications
router.get("/notifications", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate(
            "notifications.relatedTo"
        );
        res.json(user.notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
router.patch("/notifications/:notificationId", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const notification = user.notifications.id(req.params.notificationId);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        notification.read = true;
        await user.save();
        res.json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user tasks
router.get("/tasks", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: "tasks",
            populate: {
                path: "project",
                select: "name",
            },
        });
        res.json(user.tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user projects
router.get("/projects", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("projects");
        res.json(user.projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
