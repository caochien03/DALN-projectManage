require("dotenv").config();
const mongoose = require("mongoose");
const Notification = require("./src/models/Notification");
const User = require("./src/models/User");

const testBadgeRealtime = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Lấy user để tạo notification test
        const user = await User.findOne();
        if (!user) {
            console.log("❌ No users found");
            return;
        }

        console.log(`\n👤 Creating test notification for user: ${user.name}`);

        // Tạo notification test
        const testNotification = await Notification.create({
            user: user._id,
            type: "task_due",
            message: `Test notification created at ${new Date().toLocaleString()} - Badge should update immediately!`,
            relatedTo: null,
            onModel: "Task",
            read: false,
        });

        console.log("✅ Test notification created:", testNotification._id);
        console.log("📱 Badge should update immediately in the frontend!");
        console.log("💡 Check the notification bell in your browser.");

        // Đợi 5 giây rồi xóa notification test
        console.log("\n⏳ Waiting 5 seconds before cleaning up...");
        setTimeout(async () => {
            await Notification.findByIdAndDelete(testNotification._id);
            console.log("🧹 Test notification cleaned up");
            await mongoose.connection.close();
            process.exit(0);
        }, 5000);
    } catch (error) {
        console.error("❌ Error testing badge realtime:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

testBadgeRealtime();
