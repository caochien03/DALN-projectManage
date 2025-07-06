const UserService = require("../services/user.service");

exports.createUser = async (req, res) => {
    try {
        const user = await UserService.createUser(req.body);
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
        const user = await UserService.updateUser(req.params.id, req.body);
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
        await UserService.deleteUser(req.params.id);
        res.json({ success: true, message: "Xóa user thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsersWithProjectStats = async (req, res) => {
    try {
        const users = await UserService.getAllUsersWithProjectStats();
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q, role, department } = req.query;
        const users = await UserService.searchUsers(q, { role, department });

        res.json({
            success: true,
            data: users,
            count: users.length,
            searchTerm: q || "",
            filters: { role, department },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await UserService.getUserNotifications(
            req.user._id
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const notification = await UserService.markNotificationAsRead(
            req.user._id,
            req.params.notificationId
        );
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
        const tasks = await UserService.getUserTasks(req.user._id);
        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserProjects = async (req, res) => {
    try {
        const projects = await UserService.getUserProjects(req.user._id);
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        const avatar = await UserService.uploadAvatar(
            req.params.id,
            avatarPath
        );

        res.json({ success: true, avatar });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const stats = await UserService.getUserStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get users by department
exports.getUsersByDepartment = async (req, res) => {
    try {
        const users = await UserService.getUsersByDepartment(
            req.params.departmentId
        );
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bulk update users
exports.bulkUpdateUsers = async (req, res) => {
    try {
        const { userIds, updates } = req.body;
        const result = await UserService.bulkUpdateUsers(userIds, updates);
        res.json({
            success: true,
            message: "Cập nhật hàng loạt thành công!",
            data: result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bulk delete users
exports.bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        const result = await UserService.bulkDeleteUsers(userIds);
        res.json({
            success: true,
            message: "Xóa hàng loạt thành công!",
            data: result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
