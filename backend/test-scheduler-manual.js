require("dotenv").config();
const mongoose = require("mongoose");
const NotificationScheduler = require("./src/services/notificationScheduler");

// Import models to register schemas
require("./src/models/User");
require("./src/models/Project");
require("./src/models/Task");
require("./src/models/Notification");

const testSchedulerManual = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        console.log("\n🔔 Testing notification scheduler manually...");
        console.log("Current time:", new Date().toLocaleString());

        // Test 1: Kiểm tra task sắp đến hạn
        console.log("\n1. Checking due tasks...");
        await NotificationScheduler.checkDueTasks();

        // Test 2: Kiểm tra task quá hạn
        console.log("\n2. Checking overdue tasks...");
        await NotificationScheduler.checkOverdueTasks();

        // Test 3: Kiểm tra project sắp đến hạn
        console.log("\n3. Checking project due...");
        await NotificationScheduler.checkProjectDue();

        console.log("\n✅ Manual scheduler test completed!");
        console.log("Check the notifications in your database or frontend.");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error testing scheduler:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

testSchedulerManual();
