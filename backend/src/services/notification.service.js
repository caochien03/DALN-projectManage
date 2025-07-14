const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("./email.service");
const nodemailer = require("nodemailer");

// Hàm gửi email thông báo chung
const sendNotificationEmail = async (to, subject, message) => {
    // Sử dụng transporter từ email.service.js
    const { EMAIL_USER } = process.env;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
    });
    await transporter.sendMail({
        from: EMAIL_USER,
        to,
        subject,
        html: `<p>${message}</p>`,
    });
};

// Tạo thông báo mới và gửi email
const createNotification = async (notificationData) => {
    const notification = new Notification(notificationData);
    await notification.save();

    // Gửi email cho user nhận thông báo
    try {
        const user = await User.findById(notificationData.user);
        if (user && user.email) {
            // Xác định subject theo loại thông báo
            let subject = "Thông báo mới từ hệ thống quản lý dự án";
            if (notificationData.type === "task_assigned")
                subject = "Bạn được giao nhiệm vụ mới";
            else if (notificationData.type === "task_due")
                subject = "Nhiệm vụ sắp đến hạn";
            else if (notificationData.type === "task_status_update")
                subject = "Cập nhật trạng thái nhiệm vụ";
            else if (notificationData.type === "new_comment")
                subject = "Có bình luận mới";
            else if (notificationData.type === "added_to_project")
                subject = "Bạn được thêm vào dự án";
            else if (notificationData.type === "project_update")
                subject = "Cập nhật dự án";
            else if (notificationData.type === "milestone_created")
                subject = "Milestone mới";
            else if (notificationData.type === "mention")
                subject = "Bạn được nhắc đến";
            else if (notificationData.type === "new_document")
                subject = "Tài liệu mới";
            await sendNotificationEmail(
                user.email,
                subject,
                notificationData.message
            );
        }
    } catch (err) {
        console.error("Gửi email thông báo thất bại:", err.message);
    }

    return notification;
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
