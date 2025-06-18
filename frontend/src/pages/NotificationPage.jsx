import React, { useState, useEffect } from "react";
import notificationService from "../services/notificationService";

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await notificationService.getNotificationsByUser(
                    "123"
                ); // Thay 123 bằng userId thực tế
                setNotifications(Array.isArray(data) ? data : []);
                setError(null);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setError("Failed to fetch notifications");
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) {
        return <div>Loading notifications...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="notification-page">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No notifications found</p>
            ) : (
                <ul className="notification-list">
                    {notifications.map((notification) => (
                        <li
                            key={notification._id}
                            className="notification-item"
                        >
                            <strong>{notification.type}</strong>:{" "}
                            {notification.message}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationPage;
