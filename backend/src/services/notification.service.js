const Notification = require("../models/Notification");

// Tạo thông báo mới
const createNotification = async (notificationData) => {
    const notification = new Notification(notificationData);
    return await notification.save();
};

// Lấy tất cả thông báo của một người dùng
const getNotificationsByUser = async (userId) => {
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
};

// Đánh dấu thông báo là đã đọc
const markNotificationAsRead = async (notificationId) => {
    return await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    );
};

// Xóa thông báo
const deleteNotification = async (notificationId) => {
    return await Notification.findByIdAndDelete(notificationId);
};

// Kiểm tra notification đã tồn tại (để tránh gửi trùng lặp)
const getNotificationByTaskAndType = async (taskId, type, userId) => {
    return await Notification.findOne({
        relatedTo: taskId,
        type: type,
        user: userId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Trong 24h gần đây
    });
};

// Lấy số lượng thông báo chưa đọc
const getUnreadCount = async (userId) => {
    return await Notification.countDocuments({
        user: userId,
        read: false,
    });
};

// Đánh dấu tất cả thông báo là đã đọc
const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
    );
};

module.exports = {
    createNotification,
    getNotificationsByUser,
    markNotificationAsRead,
    deleteNotification,
    getNotificationByTaskAndType,
    getUnreadCount,
    markAllAsRead,
};
