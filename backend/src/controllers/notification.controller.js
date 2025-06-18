const notificationService = require("../services/notification.service");

// Tạo thông báo mới
const createNotification = async (req, res) => {
    try {
        const notification = await notificationService.createNotification(
            req.body
        );
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy tất cả thông báo của một người dùng
const getNotificationsByUser = async (req, res) => {
    try {
        const notifications = await notificationService.getNotificationsByUser(
            req.params.userId
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đánh dấu thông báo là đã đọc
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await notificationService.markNotificationAsRead(
            req.params.notificationId
        );
        res.status(200).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa thông báo
const deleteNotification = async (req, res) => {
    try {
        await notificationService.deleteNotification(req.params.notificationId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createNotification,
    getNotificationsByUser,
    markNotificationAsRead,
    deleteNotification,
};
