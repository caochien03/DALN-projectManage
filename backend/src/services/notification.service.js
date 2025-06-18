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

module.exports = {
    createNotification,
    getNotificationsByUser,
    markNotificationAsRead,
    deleteNotification,
};
