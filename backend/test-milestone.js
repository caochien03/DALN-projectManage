require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("./src/models/Project");
const User = require("./src/models/User");

const testMilestone = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Lấy project đầu tiên
        const project = await Project.findOne().populate(
            "createdBy",
            "name email"
        );
        if (!project) {
            console.log("❌ No projects found. Please run the seeder first.");
            return;
        }

        console.log(
            `\n📋 Testing milestone functions for project: ${project.name}`
        );
        console.log(`Project ID: ${project._id}`);

        // Test tạo milestone mới
        console.log("\n1. Testing create milestone...");
        const milestoneData = {
            name: "Test Milestone",
            description: "This is a test milestone",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        };

        // Thêm milestone vào project
        project.milestones.push(milestoneData);
        await project.save();

        console.log("✅ Milestone created successfully");
        console.log(`Current milestones: ${project.milestones.length}`);

        // Test cập nhật milestone
        console.log("\n2. Testing update milestone...");
        const milestoneToUpdate =
            project.milestones[project.milestones.length - 1];
        milestoneToUpdate.name = "Updated Test Milestone";
        milestoneToUpdate.description = "This milestone has been updated";
        await project.save();

        console.log("✅ Milestone updated successfully");

        // Test xóa milestone
        console.log("\n3. Testing delete milestone...");
        project.milestones.pop(); // Xóa milestone cuối cùng
        await project.save();

        console.log("✅ Milestone deleted successfully");
        console.log(`Current milestones: ${project.milestones.length}`);

        await mongoose.connection.close();
        console.log("\n🎉 All milestone tests completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error testing milestone:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

testMilestone();
