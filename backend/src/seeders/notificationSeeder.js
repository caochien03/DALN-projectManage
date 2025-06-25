const Notification = require("../models/Notification");

const seedNotifications = async (users) => {
    try {
        // Delete existing notifications
        await Notification.deleteMany({});

        const notifications = [
            {
                user: users[0]._id, // Admin
                type: "task_assigned",
                message: "Bạn đã được giao task mới: Thiết kế giao diện",
                relatedTo: null,
                onModel: "Task",
                read: false,
            },
            {
                user: users[1]._id, // Project Manager
                type: "new_comment",
                message: "Có comment mới trong task: Phát triển backend",
                relatedTo: null,
                onModel: "Comment",
                read: false,
            },
            {
                user: users[2]._id, // Developer
                type: "task_due",
                message: "Task của bạn sắp đến hạn: Kiểm thử API",
                relatedTo: null,
                onModel: "Task",
                read: false,
            },
            {
                user: users[0]._id, // Admin
                type: "added_to_project",
                message: "Bạn đã được thêm vào dự án: Website Redesign",
                relatedTo: null,
                onModel: "Project",
                read: true,
            },
            {
                user: users[1]._id, // Project Manager
                type: "task_status_update",
                message: "Task đã được cập nhật trạng thái thành completed",
                relatedTo: null,
                onModel: "Task",
                read: false,
            },
            {
                user: users[2]._id, // Developer
                type: "new_document",
                message: "Tài liệu mới đã được thêm vào dự án",
                relatedTo: null,
                onModel: "Document",
                read: false,
            },
            {
                user: users[0]._id, // Admin
                type: "approval_request",
                message: "Bạn có yêu cầu phê duyệt mới cần xử lý",
                relatedTo: null,
                onModel: "Project",
                read: false,
            },
            {
                user: users[1]._id, // Project Manager
                type: "mention",
                message: "Bạn được nhắc đến trong một comment",
                relatedTo: null,
                onModel: "Comment",
                read: true,
            },
        ];

        const createdNotifications = await Notification.insertMany(
            notifications
        );
        console.log("Notifications seeded successfully");
        return createdNotifications;
    } catch (error) {
        console.error("Error seeding notifications:", error);
        throw error;
    }
};

module.exports = seedNotifications;
