require("dotenv").config();
const mongoose = require("mongoose");
const Comment = require("./src/models/Comment");
const Project = require("./src/models/Project");
const Task = require("./src/models/Task");
const User = require("./src/models/User");
const Notification = require("./src/models/Notification");

const testMention = async () => {
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

        // Lấy task đầu tiên
        const task = await Task.findOne();
        if (!task) {
            console.log("❌ No tasks found. Please run the seeder first.");
            return;
        }

        console.log(`\n📋 Testing mention notification functionality`);
        console.log(`User: ${user.name} (${user._id})`);
        console.log(`Project: ${project.name} (${project._id})`);
        console.log(`Task: ${task.title} (${task._id})`);

        // Test tạo comment với mention trong project
        console.log("\n1. Testing project comment with mention...");
        const projectComment = await Comment.create({
            project: project._id,
            author: user._id,
            content: `@${user.name} Hãy xem xét milestone này`,
            mentions: [user._id],
        });

        console.log("✅ Project comment created with mention");

        // Test tạo comment với mention trong task
        console.log("\n2. Testing task comment with mention...");
        const taskComment = await Comment.create({
            task: task._id,
            author: user._id,
            content: `@${user.name} Task này cần được hoàn thành sớm`,
            mentions: [user._id],
        });

        console.log("✅ Task comment created with mention");

        // Kiểm tra notifications được tạo
        console.log("\n3. Checking created notifications...");
        const notifications = await Notification.find({
            type: "mention",
            user: user._id,
        }).populate("relatedTo");

        console.log(`Found ${notifications.length} mention notifications:`);
        notifications.forEach((notification, index) => {
            console.log(
                `${index + 1}. ${notification.message} (Comment: ${
                    notification.relatedTo?._id
                })`
            );
        });

        // Test lấy comment detail
        console.log("\n4. Testing get comment detail...");
        const commentDetail = await Comment.findById(projectComment._id)
            .populate("author", "name email")
            .populate("project", "name")
            .populate("task", "title");

        console.log("✅ Comment detail retrieved:");
        console.log(`   Content: ${commentDetail.content}`);
        console.log(`   Author: ${commentDetail.author?.name}`);
        console.log(`   Project: ${commentDetail.project?.name || "N/A"}`);
        console.log(`   Task: ${commentDetail.task?.title || "N/A"}`);

        await mongoose.connection.close();
        console.log("\n🎉 All mention tests completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error testing mention:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

testMention();
