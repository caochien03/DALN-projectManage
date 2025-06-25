const axios = require("axios");

const BASE_URL = "http://localhost:8080/api";

// Test data - thay đổi email/password theo user thực tế của bạn
const testUser = {
    email: "admin@example.com", // Thay đổi email này
    password: "password123", // Thay đổi password này
};

let authToken = "";

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(
            `❌ Error in ${method} ${url}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

// Test functions
const testLogin = async () => {
    console.log("\n🔐 Testing login...");
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
        authToken = response.data.token;
        console.log("✅ Login successful");
        return true;
    } catch (error) {
        console.error(
            "❌ Login failed:",
            error.response?.data || error.message
        );
        console.log(
            "💡 Please update testUser email and password in the script"
        );
        return false;
    }
};

const testGetNotifications = async () => {
    console.log("\n📋 Testing get notifications...");
    try {
        const notifications = await makeAuthRequest("GET", "/notifications");
        console.log(`✅ Got ${notifications.length} notifications`);

        if (notifications.length > 0) {
            console.log("📝 Sample notification:");
            console.log(`   Type: ${notifications[0].type}`);
            console.log(`   Message: ${notifications[0].message}`);
            console.log(`   Read: ${notifications[0].read}`);
            console.log(
                `   Created: ${new Date(
                    notifications[0].createdAt
                ).toLocaleString()}`
            );
        }

        return notifications;
    } catch (error) {
        console.error("❌ Get notifications failed");
        return [];
    }
};

const testGetUnreadCount = async () => {
    console.log("\n🔢 Testing get unread count...");
    try {
        const result = await makeAuthRequest(
            "GET",
            "/notifications/unread-count"
        );
        console.log(`✅ Unread count: ${result.count}`);
        return result.count;
    } catch (error) {
        console.error("❌ Get unread count failed");
        return 0;
    }
};

const testMarkAsRead = async (notificationId) => {
    console.log("\n✅ Testing mark as read...");
    try {
        const result = await makeAuthRequest(
            "PUT",
            `/notifications/${notificationId}/read`
        );
        console.log("✅ Notification marked as read");
        return result;
    } catch (error) {
        console.error("❌ Mark as read failed");
        return null;
    }
};

const testMarkAllAsRead = async () => {
    console.log("\n✅ Testing mark all as read...");
    try {
        const result = await makeAuthRequest(
            "PUT",
            "/notifications/mark-all-read"
        );
        console.log("✅ All notifications marked as read");
        return result;
    } catch (error) {
        console.error("❌ Mark all as read failed");
        return null;
    }
};

const testCreateNotification = async () => {
    console.log("\n➕ Testing create notification...");
    try {
        const newNotification = {
            type: "task_assigned",
            message:
                "Test notification created at " + new Date().toLocaleString(),
            onModel: "Task",
        };

        const notification = await makeAuthRequest(
            "POST",
            "/notifications",
            newNotification
        );
        console.log("✅ Notification created:", notification._id);
        return notification;
    } catch (error) {
        console.error("❌ Create notification failed");
        return null;
    }
};

const testDeleteNotification = async (notificationId) => {
    console.log("\n🗑️ Testing delete notification...");
    try {
        await makeAuthRequest("DELETE", `/notifications/${notificationId}`);
        console.log("✅ Notification deleted");
        return true;
    } catch (error) {
        console.error("❌ Delete notification failed");
        return false;
    }
};

// Main test function
const runTests = async () => {
    console.log("🚀 Starting notification API tests...");
    console.log("📝 Using credentials:", testUser.email);

    // Test login first
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
        console.log("❌ Cannot proceed without authentication");
        console.log(
            "💡 Please update testUser in the script with valid credentials"
        );
        return;
    }

    // Test get notifications
    const notifications = await testGetNotifications();

    // Test get unread count
    await testGetUnreadCount();

    // Test create notification
    const newNotification = await testCreateNotification();

    if (newNotification) {
        // Test mark as read
        await testMarkAsRead(newNotification._id);

        // Test delete notification
        await testDeleteNotification(newNotification._id);
    }

    // Test mark all as read (chỉ nếu có notifications)
    if (notifications.length > 0) {
        await testMarkAllAsRead();
    }

    console.log("\n🎉 All tests completed!");
    console.log("\n💡 Next steps:");
    console.log("   1. Check the frontend at /notifications");
    console.log("   2. Test the notification bell icon");
    console.log("   3. Try creating real notifications from other actions");
};

// Run tests
runTests().catch(console.error);
