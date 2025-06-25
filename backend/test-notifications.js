const axios = require("axios");

const BASE_URL = "http://localhost:8080/api";

// Test data
const testUser = {
    email: "admin@example.com",
    password: "password123",
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
            `Error in ${method} ${url}:`,
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
        return false;
    }
};

const testGetNotifications = async () => {
    console.log("\n📋 Testing get notifications...");
    try {
        const notifications = await makeAuthRequest("GET", "/notifications");
        console.log(`✅ Got ${notifications.length} notifications`);
        console.log("Sample notification:", notifications[0]);
        return notifications;
    } catch (error) {
        console.error("❌ Get notifications failed");
        return [];
    }
};

const testCreateNotification = async () => {
    console.log("\n➕ Testing create notification...");
    try {
        const newNotification = {
            user: "64f8b8b8b8b8b8b8b8b8b8b8", // Replace with actual user ID
            type: "task_assigned",
            message: "Test notification from script",
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

    // Test login first
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
        console.log("❌ Cannot proceed without authentication");
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

    // Test mark all as read
    await testMarkAllAsRead();

    console.log("\n🎉 All tests completed!");
};

// Run tests
runTests().catch(console.error);
