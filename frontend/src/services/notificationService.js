import axios from "axios";

const API_URL = "/api/notifications";

const getNotificationsByUser = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};

const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axios.put(
            `/api/users/notifications/${notificationId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

const markAllNotificationsAsRead = async () => {
    try {
        const response = await axios.put(
            "/api/users/notifications/mark-all-read"
        );
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
};

const deleteNotification = async (notificationId) => {
    try {
        const response = await axios.delete(`${API_URL}/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
};

const getUnreadCount = async () => {
    try {
        const response = await axios.get(
            "/api/users/notifications/unread-count"
        );
        return response.data.count;
    } catch (error) {
        console.error("Error getting unread count:", error);
        throw error;
    }
};

export default {
    getNotificationsByUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
};
