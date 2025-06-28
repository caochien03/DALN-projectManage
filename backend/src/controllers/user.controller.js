const User = require("../models/User");

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({
            success: true,
            message: "Tạo user thành công!",
            data: user,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        Object.assign(user, req.body);
        await user.save();
        res.json({
            success: true,
            message: "Cập nhật user thành công!",
            data: user,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "Xóa user thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("department", "name");
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate(
            "notifications.relatedTo"
        );
        res.json({ success: true, data: user.notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const notification = user.notifications.id(req.params.notificationId);
        if (!notification) {
            return res
                .status(404)
                .json({ success: false, message: "Notification not found" });
        }
        notification.read = true;
        await user.save();
        res.json({
            success: true,
            message: "Đánh dấu đã đọc thông báo!",
            data: notification,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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
        res.json({ success: true, data: user.tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserProjects = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("projects");
        res.json({ success: true, data: user.projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
