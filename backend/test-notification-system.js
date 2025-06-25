require("dotenv").config();
const mongoose = require("mongoose");

// Import models to register schemas
require("./src/models/User");
require("./src/models/Project");
require("./src/models/Task");
require("./src/models/Notification");

const User = require("./src/models/User");
const Project = require("./src/models/Project");
const Task = require("./src/models/Task");
const Notification = require("./src/models/Notification");

const testNotificationSystem = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        console.log("\n🔔 Testing complete notification system...");

        // Lấy user đầu tiên để test
        const user = await User.findOne();
        if (!user) {
            console.log("❌ Không tìm thấy user nào để test");
            return;
        }

        console.log(`👤 Testing with user: ${user.name} (${user.email})`);

        // Lấy project đầu tiên
        const project = await Project.findOne();
        if (!project) {
            console.log("❌ Không tìm thấy project nào để test");
            return;
        }

        console.log(`📋 Testing with project: ${project.name}`);

        // Xóa thông báo cũ của user này
        await Notification.deleteMany({ user: user._id });
        console.log("🧹 Cleaned up old notifications");

        // Tạo các thông báo test đa dạng
        const testNotifications = [
            {
                user: user._id,
                type: "task_assigned",
                message: "Bạn được giao task mới: Test Task Assignment",
                onModel: "Task",
                relatedTo: project._id,
                read: false,
            },
            {
                user: user._id,
                type: "new_comment",
                message: "Có comment mới trong project",
                onModel: "Project",
                relatedTo: project._id,
                read: false,
            },
            {
                user: user._id,
                type: "task_due",
                message: "Task sắp đến hạn: Test Due Task",
                onModel: "Task",
                relatedTo: project._id,
                read: false,
            },
            {
                user: user._id,
                type: "new_document",
                message: "Document mới được upload",
                onModel: "Project",
                relatedTo: project._id,
                read: false,
            },
            {
                user: user._id,
                type: "mention",
                message: "Bạn được mention trong comment",
                onModel: "Comment",
                relatedTo: project._id,
                read: false,
            },
            {
                user: user._id,
                type: "milestone_created",
                message: "Milestone mới được tạo",
                onModel: "Project",
                relatedTo: project._id,
                read: true, // Một thông báo đã đọc
            },
        ];

        const createdNotifications = await Notification.insertMany(
            testNotifications
        );
        console.log(
            `✅ Created ${createdNotifications.length} test notifications`
        );

        // Kiểm tra số thông báo chưa đọc
        const unreadNotifications = await Notification.find({
            user: user._id,
            read: false,
        });

        console.log(
            `📊 Unread notifications count: ${unreadNotifications.length}`
        );

        // Hiển thị chi tiết thông báo
        console.log("\n📋 Notification details:");
        for (const notification of createdNotifications) {
            console.log(
                `- ${notification.type}: ${notification.message} (${
                    notification.read ? "Đã đọc" : "Chưa đọc"
                })`
            );
        }

        console.log("\n🎯 Badge should show:", unreadNotifications.length);
        console.log("💡 Features to test:");
        console.log("1. Notification bell badge shows correct count");
        console.log("2. Popup notifications appear for new notifications");
        console.log("3. Clicking notifications navigates to correct pages");
        console.log("4. Mark as read functionality works");
        console.log("5. Notification page shows all notifications");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error testing notification system:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

testNotificationSystem();
