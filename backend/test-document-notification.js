require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("./src/models/Document");
const Project = require("./src/models/Project");
const User = require("./src/models/User");
const Notification = require("./src/models/Notification");
const documentService = require("./src/services/document.service");

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

        // Debug: Kiểm tra cấu trúc members
        console.log("\n🔍 Debug project members structure:");
        project.members.forEach((member, index) => {
            console.log(`Member ${index + 1}:`, {
                user: member.user
                    ? `${member.user.name} (${member.user._id})`
                    : "NULL",
                role: member.role,
                userObject: member.user,
            });
        });

        // Mock req và res objects để test uploadDocument service
        const mockReq = {
            params: { id: project._id.toString() },
            user: { _id: user._id },
            file: {
                originalname: "test-document.pdf",
                filename: "test-document.pdf",
                size: 1024,
                mimetype: "application/pdf",
            },
        };

        const mockRes = {
            status: (code) => ({ json: (data) => data }),
            json: (data) => data,
        };

        // Test tạo document mới qua service
        console.log(
            "\n1. Testing document creation with notification via service..."
        );
        const document = await documentService.uploadDocument(mockReq, mockRes);

        console.log("✅ Document created successfully via service");

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

        // Cleanup - xóa document test
        await Document.findByIdAndDelete(document._id);
        await Notification.deleteMany({ relatedTo: document._id });

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
