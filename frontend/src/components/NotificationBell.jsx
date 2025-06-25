import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useNotificationContext } from "./NotificationProvider";

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const { notifications } = useNotificationContext();

    useEffect(() => {
        // Kiểm tra xem user đã đăng nhập chưa
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);

        if (token) {
            fetchUnreadCount();

            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);

            return () => clearInterval(interval);
        }
    }, []);

    // Update unread count when notifications change
    useEffect(() => {
        if (isAuthenticated) {
            const unreadNotifications = notifications.filter((n) => !n.read);
            setUnreadCount(unreadNotifications.length);
        }
    }, [notifications, isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/notifications");
            const unreadNotifications = response.data.filter((n) => !n.read);
            setUnreadCount(unreadNotifications.length);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        navigate("/notifications");
    };

    // Không render nếu chưa đăng nhập
    if (!isAuthenticated) {
        return null;
    }

    return (
        <button
            onClick={handleClick}
            className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
            title="Thông báo"
        >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
            {loading && (
                <div className="absolute -top-1 -right-1 h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            )}
        </button>
    );
};

export default NotificationBell;
