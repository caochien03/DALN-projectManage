const User = require("../models/User");

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
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
};

exports.deleteUser = async (req, res) => {
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
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("department", "name");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate(
            "notifications.relatedTo"
        );
        res.json(user.notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
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
};

exports.getUserTasks = async (req, res) => {
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
};

exports.getUserProjects = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("projects");
        res.json(user.projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
