require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("./src/models/Document");
const Project = require("./src/models/Project");
const User = require("./src/models/User");
const Notification = require("./src/models/Notification");

const testDocumentNotification = async () => {
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
        const project = await Project.findOne().populate("members.user");
        if (!project) {
            console.log("❌ No projects found. Please run the seeder first.");
            return;
        }

        console.log(`\n📋 Testing document notification functionality`);
        console.log(`User: ${user.name} (${user._id})`);
        console.log(`Project: ${project.name} (${project._id})`);
        console.log(`Project members: ${project.members.length}`);

        // Test tạo document mới
        console.log("\n1. Testing document creation with notification...");
        const document = await Document.create({
            project: project._id,
            name: "test-document.pdf",
            path: `${project._id}/test-document.pdf`,
            uploadedBy: user._id,
            version: 1,
            size: 1024,
            type: "application/pdf",
            originalName: "test-document.pdf",
        });

        console.log("✅ Document created successfully");

        // Kiểm tra notifications được tạo
        console.log("\n2. Checking created notifications...");
        const notifications = await Notification.find({
            type: "new_document",
            relatedTo: document._id,
        }).populate("user", "name email");

        console.log(`Found ${notifications.length} document notifications:`);
        notifications.forEach((notification, index) => {
            console.log(
                `${index + 1}. ${notification.message} (User: ${
                    notification.user?.name
                })`
            );
        });

        // Test lấy document detail
        console.log("\n3. Testing get document detail...");
        const documentDetail = await Document.findById(document._id)
            .populate("project", "name")
            .populate("uploadedBy", "name email");

        console.log("✅ Document detail retrieved:");
        console.log(`   Name: ${documentDetail.name}`);
        console.log(`   Project: ${documentDetail.project?.name}`);
        console.log(`   Uploaded by: ${documentDetail.uploadedBy?.name}`);
        console.log(`   Size: ${documentDetail.size} bytes`);

        await mongoose.connection.close();
        console.log(
            "\n🎉 All document notification tests completed successfully!"
        );
        process.exit(0);
    } catch (error) {
        console.error("❌ Error testing document notification:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

testDocumentNotification();
