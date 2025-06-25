const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const NotificationController = require("../controllers/notification.controller");

// Tạo thông báo mới
router.post("/", auth, NotificationController.createNotification);

// Lấy tất cả thông báo của user hiện tại
router.get("/", auth, NotificationController.getCurrentUserNotifications);

// Lấy tất cả thông báo của một người dùng cụ thể
router.get(
    "/user/:userId",
    auth,
    NotificationController.getNotificationsByUser
);

// Đánh dấu thông báo là đã đọc
router.put(
    "/:notificationId/read",
    auth,
    NotificationController.markNotificationAsRead
);

// Xóa thông báo
router.delete(
    "/:notificationId",
    auth,
    NotificationController.deleteNotification
);

// Lấy số lượng thông báo chưa đọc
router.get("/unread-count", auth, async (req, res) => {
    try {
        const Notification = require("../models/Notification");
        const count = await Notification.countDocuments({
            user: req.user._id,
            read: false,
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Đánh dấu tất cả thông báo là đã đọc
router.put("/mark-all-read", auth, async (req, res) => {
    try {
        const Notification = require("../models/Notification");
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
