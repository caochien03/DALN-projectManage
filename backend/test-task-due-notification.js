require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./src/models/Task");
const Project = require("./src/models/Project");
const User = require("./src/models/User");
const Notification = require("./src/models/Notification");
const NotificationScheduler = require("./src/services/notificationScheduler");

const testTaskDueNotification = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Lấy user đầu tiên để test
        const user = await User.findOne();
        if (!user) {
            console.log("❌ No users found. Please run the seeder first.");
            return;
        }

        // Lấy project đầu tiên
        const project = await Project.findOne();
        if (!project) {
            console.log("❌ No projects found. Please run the seeder first.");
            return;
        }

        console.log(`\n📋 Testing task due notification functionality`);
        console.log(`User: ${user.name} (${user._id})`);
        console.log(`Project: ${project.name} (${project._id})`);

        // Xóa các task cũ để test
        await Task.deleteMany({ project: project._id });
        console.log("🧹 Cleaned up old tasks");

        // Test 1: Tạo task sắp đến hạn (trong vòng 24h)
        console.log("\n1. Testing task due soon (within 24h)...");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0); // 10:00 AM tomorrow

        const dueTask = await Task.create({
            title: "Test Task Due Soon",
            description: "This task is due tomorrow",
            project: project._id,
            assignedTo: user._id,
            status: "todo",
            priority: "high",
            startDate: new Date(),
            dueDate: tomorrow,
        });

        console.log("✅ Created task due tomorrow:", dueTask.title);

        // Test 2: Tạo task quá hạn
        console.log("\n2. Testing overdue task...");
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(10, 0, 0, 0); // 10:00 AM yesterday

        const overdueTask = await Task.create({
            title: "Test Overdue Task",
            description: "This task is overdue",
            project: project._id,
            assignedTo: user._id,
            status: "todo",
            priority: "high",
            startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            dueDate: yesterday,
        });

        console.log("✅ Created overdue task:", overdueTask.title);

        // Test 3: Tạo task xa hạn (không nên tạo notification)
        console.log(
            "\n3. Testing task due later (should not create notification)..."
        );
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(10, 0, 0, 0);

        const futureTask = await Task.create({
            title: "Test Future Task",
            description: "This task is due next week",
            project: project._id,
            assignedTo: user._id,
            status: "todo",
            priority: "medium",
            startDate: new Date(),
            dueDate: nextWeek,
        });

        console.log("✅ Created future task:", futureTask.title);

        // Test 4: Chạy notification scheduler
        console.log("\n4. Running notification scheduler...");
        await NotificationScheduler.checkDueTasks();
        await NotificationScheduler.checkOverdueTasks();

        // Test 5: Kiểm tra notifications được tạo
        console.log("\n5. Checking created notifications...");
        const notifications = await Notification.find({
            user: user._id,
            type: "task_due",
        }).populate("relatedTo", "title dueDate");

        console.log(`Found ${notifications.length} due notifications:`);
        notifications.forEach((notification, index) => {
            const task = notification.relatedTo;
            console.log(`${index + 1}. ${notification.message}`);
            console.log(`   Task: ${task?.title || "Unknown"}`);
            console.log(
                `   Due Date: ${
                    task?.dueDate?.toLocaleDateString() || "Unknown"
                }`
            );
            console.log(
                `   Created: ${notification.createdAt.toLocaleString()}`
            );
        });

        // Test 6: Kiểm tra task sắp đến hạn
        console.log("\n6. Checking tasks due soon...");
        const dueTasks = await Task.find({
            dueDate: {
                $gte: new Date(),
                $lte: tomorrow,
            },
            status: { $ne: "completed" },
            assignedTo: { $exists: true, $ne: null },
        }).populate("assignedTo", "name email");

        console.log(`Found ${dueTasks.length} tasks due soon:`);
        dueTasks.forEach((task, index) => {
            console.log(
                `${index + 1}. ${
                    task.title
                } - Due: ${task.dueDate.toLocaleDateString()}`
            );
        });

        // Test 7: Kiểm tra task quá hạn
        console.log("\n7. Checking overdue tasks...");
        const overdueTasks = await Task.find({
            dueDate: { $lt: new Date() },
            status: { $ne: "completed" },
            assignedTo: { $exists: true, $ne: null },
        }).populate("assignedTo", "name email");

        console.log(`Found ${overdueTasks.length} overdue tasks:`);
        overdueTasks.forEach((task, index) => {
            console.log(
                `${index + 1}. ${
                    task.title
                } - Due: ${task.dueDate.toLocaleDateString()}`
            );
        });

        await mongoose.connection.close();
        console.log(
            "\n🎉 All task due notification tests completed successfully!"
        );
        process.exit(0);
    } catch (error) {
        console.error("❌ Error testing task due notification:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

testTaskDueNotification();
