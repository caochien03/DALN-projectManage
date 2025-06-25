require("dotenv").config();
const mongoose = require("mongoose");
const Notification = require("./src/models/Notification");
const User = require("./src/models/User");

const addTestNotifications = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Lấy danh sách users hiện có
        const users = await User.find().limit(3); // Lấy 3 user đầu tiên
        console.log(`Found ${users.length} users`);

        if (users.length === 0) {
            console.log("No users found. Please create users first.");
            return;
        }

        // Kiểm tra xem đã có notifications chưa
        const existingNotifications = await Notification.countDocuments();
        if (existingNotifications > 0) {
            console.log(
                `Found ${existingNotifications} existing notifications. Skipping...`
            );
            return;
        }

        // Tạo notifications test
        const notifications = [
            {
                user: users[0]._id,
                type: "task_assigned",
                message: "Bạn đã được giao task mới: Thiết kế giao diện",
                relatedTo: null,
                onModel: "Task",
                read: false,
            },
            {
                user: users[1] ? users[1]._id : users[0]._id,
                type: "new_comment",
                message: "Có comment mới trong task: Phát triển backend",
                relatedTo: null,
                onModel: "Comment",
                read: false,
            },
            {
                user: users[2] ? users[2]._id : users[0]._id,
                type: "task_due",
                message: "Task của bạn sắp đến hạn: Kiểm thử API",
                relatedTo: null,
                onModel: "Task",
                read: false,
            },
            {
                user: users[0]._id,
                type: "added_to_project",
                message: "Bạn đã được thêm vào dự án: Website Redesign",
                relatedTo: null,
                onModel: "Project",
                read: true,
            },
            {
                user: users[1] ? users[1]._id : users[0]._id,
                type: "task_status_update",
                message: "Task đã được cập nhật trạng thái thành completed",
                relatedTo: null,
                onModel: "Task",
                read: false,
            },
            {
                user: users[2] ? users[2]._id : users[0]._id,
                type: "new_document",
                message: "Tài liệu mới đã được thêm vào dự án",
                relatedTo: null,
                onModel: "Document",
                read: false,
            },
            {
                user: users[0]._id,
                type: "approval_request",
                message: "Bạn có yêu cầu phê duyệt mới cần xử lý",
                relatedTo: null,
                onModel: "Project",
                read: false,
            },
            {
                user: users[1] ? users[1]._id : users[0]._id,
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
        console.log(
            `✅ Added ${createdNotifications.length} test notifications`
        );

        // Hiển thị thông tin notifications đã tạo
        console.log("\n📋 Created notifications:");
        createdNotifications.forEach((notification, index) => {
            console.log(
                `${index + 1}. ${notification.type}: ${
                    notification.message
                } (User: ${notification.user})`
            );
        });

        await mongoose.connection.close();
        console.log("\n🎉 Test notifications added successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding notifications:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Chạy script
addTestNotifications();
