import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axios";

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [popupNotifications, setPopupNotifications] = useState([]);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/notifications");
            const newNotifications = response.data.data;

            setNotifications((prevNotifications) => {
                // Kiểm tra thông báo mới
                const newUnreadNotifications = newNotifications.filter(
                    (notification) =>
                        !notification.read &&
                        !prevNotifications.some(
                            (existing) => existing._id === notification._id
                        )
                );

                if (newUnreadNotifications.length > 0) {
                    console.log(
                        `[useNotifications] Found ${newUnreadNotifications.length} new unread notifications`
                    );
                    setPopupNotifications((prev) => [
                        ...prev,
                        ...newUnreadNotifications,
                    ]);
                }

                // Cập nhật unread count
                const newUnreadCount = newNotifications.filter(
                    (n) => !n.read
                ).length;
                setUnreadCount(newUnreadCount);

                return newNotifications;
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await axiosInstance.put(
                `/api/notifications/${notificationId}/read`
            );
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
            // Cập nhật unread count ngay lập tức
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await axiosInstance.put("/api/notifications/mark-all-read");
            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await axiosInstance.delete(`/api/notifications/${notificationId}`);
            setNotifications((prev) => {
                const deletedNotification = prev.find(
                    (n) => n._id === notificationId
                );
                const newNotifications = prev.filter(
                    (notif) => notif._id !== notificationId
                );

                // Cập nhật unread count nếu notification bị xóa chưa đọc
                if (deletedNotification && !deletedNotification.read) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }

                return newNotifications;
            });
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    }, []);

    const removePopupNotification = useCallback((notificationId) => {
        setPopupNotifications((prev) =>
            prev.filter((notif) => notif._id !== notificationId)
        );
    }, []);

    const clearAllPopups = useCallback(() => {
        setPopupNotifications([]);
    }, []);

    useEffect(() => {
        // Chỉ fetch notifications nếu user đã đăng nhập
        const token = localStorage.getItem("token");
        if (token) {
            fetchNotifications();

            // Poll for new notifications every 15 seconds (giảm từ 30s)
            const interval = setInterval(fetchNotifications, 15000);

            // Thêm event listener để cập nhật khi có notification mới từ server
            const handleNewNotification = () => {
                console.log(
                    "[useNotifications] Received new notification event, fetching..."
                );
                fetchNotifications();
            };

            // Lắng nghe custom event khi có notification mới
            window.addEventListener("newNotification", handleNewNotification);

            // Lắng nghe event cập nhật badge count
            const handleUpdateBadgeCount = (event) => {
                const { count } = event.detail;
                console.log(
                    "[useNotifications] Updating badge count to:",
                    count
                );
                setUnreadCount(count);
            };
            window.addEventListener("updateBadgeCount", handleUpdateBadgeCount);

            return () => {
                clearInterval(interval);
                window.removeEventListener(
                    "newNotification",
                    handleNewNotification
                );
                window.removeEventListener(
                    "updateBadgeCount",
                    handleUpdateBadgeCount
                );
            };
        }
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        popupNotifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        removePopupNotification,
        clearAllPopups,
    };
};
