import React, { useState, useEffect } from "react";
import {
    BellIcon,
    CheckIcon,
    TrashIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { getTaskById } from "../services/task";
import { getCommentById } from "../services/comment";
import { getDocumentById } from "../services/document";
import Loading from "../components/Loading";

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all"); // all, unread, read
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/notifications");
            setNotifications(response.data.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError("Không thể tải thông báo");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
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
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put("/api/notifications/mark-all-read");
            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, read: true }))
            );
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axiosInstance.delete(`/api/notifications/${notificationId}`);
            setNotifications((prev) =>
                prev.filter((notif) => notif._id !== notificationId)
            );
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "task_assigned":
                return "📋";
            case "task_due":
                return "⏰";
            case "task_status_update":
                return "🔄";
            case "new_comment":
                return "💬";
            case "new_document":
                return "📄";
            case "added_to_project":
                return "👥";
            case "added_to_department":
                return "🏢";
            case "approval_request":
                return "✅";
            case "mention":
                return "👤";
            case "milestone_created":
                return "🎯";
            default:
                return "🔔";
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case "task_assigned":
                return "bg-blue-100 text-blue-800";
            case "task_due":
                return "bg-red-100 text-red-800";
            case "task_status_update":
                return "bg-yellow-100 text-yellow-800";
            case "new_comment":
                return "bg-green-100 text-green-800";
            case "new_document":
                return "bg-purple-100 text-purple-800";
            case "added_to_project":
                return "bg-indigo-100 text-indigo-800";
            case "added_to_department":
                return "bg-gray-100 text-gray-800";
            case "approval_request":
                return "bg-orange-100 text-orange-800";
            case "mention":
                return "bg-pink-100 text-pink-800";
            case "milestone_created":
                return "bg-teal-100 text-teal-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return "Vừa xong";
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Navigate based on notification type
        if (notification.onModel === "Project" && notification.relatedTo) {
            navigate(`/projects/${notification.relatedTo}`);
        } else if (notification.onModel === "Task" && notification.relatedTo) {
            try {
                // Lấy task detail để lấy project ID
                const task = await getTaskById(notification.relatedTo);
                if (task && task.project) {
                    navigate(`/projects/${task.project._id || task.project}`);
                } else {
                    console.error(
                        "Task không có project hoặc project không tồn tại"
                    );
                }
            } catch (error) {
                console.error("Không thể lấy thông tin task:", error);
            }
        } else if (
            notification.onModel === "Comment" &&
            notification.relatedTo
        ) {
            try {
                // Lấy comment detail để lấy project hoặc task ID
                const comment = await getCommentById(notification.relatedTo);
                if (comment) {
                    if (comment.project) {
                        // Comment thuộc về project
                        navigate(
                            `/projects/${
                                comment.project._id || comment.project
                            }`
                        );
                    } else if (comment.task) {
                        // Comment thuộc về task, cần lấy project từ task
                        const task = await getTaskById(
                            comment.task._id || comment.task
                        );
                        if (task && task.project) {
                            navigate(
                                `/projects/${task.project._id || task.project}`
                            );
                        } else {
                            console.error(
                                "Task không có project hoặc project không tồn tại"
                            );
                        }
                    } else {
                        console.error(
                            "Comment không thuộc về project hoặc task nào"
                        );
                    }
                } else {
                    console.error("Không tìm thấy comment");
                }
            } catch (error) {
                console.error("Không thể lấy thông tin comment:", error);
            }
        } else if (
            notification.onModel === "Document" &&
            notification.relatedTo
        ) {
            try {
                // Lấy document detail để lấy project ID
                const document = await getDocumentById(notification.relatedTo);
                if (document && document.project) {
                    navigate(
                        `/projects/${document.project._id || document.project}`
                    );
                } else {
                    console.error(
                        "Document không có project hoặc project không tồn tại"
                    );
                }
            } catch (error) {
                console.error("Không thể lấy thông tin document:", error);
            }
        }
        // milestone_created notifications có onModel là "Project" nên sẽ được xử lý ở trên
    };

    const filteredNotifications = notifications.filter((notification) => {
        if (filter === "unread") return !notification.read;
        if (filter === "read") return notification.read;
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BellIcon className="h-6 w-6 text-indigo-600" />
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Thông báo
                            </h1>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Đánh dấu tất cả đã đọc
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-3 border-b border-gray-200">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                filter === "all"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Tất cả ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                filter === "unread"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Chưa đọc ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter("read")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                filter === "read"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Đã đọc ({notifications.length - unreadCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-gray-200">
                    {filteredNotifications.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Không có thông báo
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === "all"
                                    ? "Bạn chưa có thông báo nào"
                                    : filter === "unread"
                                    ? "Tất cả thông báo đã được đọc"
                                    : "Không có thông báo đã đọc"}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                                    !notification.read ? "bg-blue-50" : ""
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <span className="text-2xl">
                                            {getNotificationIcon(
                                                notification.type
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationColor(
                                                        notification.type
                                                    )}`}
                                                >
                                                    {notification.type.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-500">
                                                    {formatTime(
                                                        notification.createdAt
                                                    )}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification._id
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-green-600"
                                                            title="Đánh dấu đã đọc"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            deleteNotification(
                                                                notification._id
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-red-600"
                                                        title="Xóa thông báo"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <p
                                            className={`mt-1 text-sm ${
                                                !notification.read
                                                    ? "font-medium text-gray-900"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {notification.message}
                                        </p>
                                        {notification.relatedTo && (
                                            <button
                                                onClick={() =>
                                                    handleNotificationClick(
                                                        notification
                                                    )
                                                }
                                                className="mt-2 inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800"
                                            >
                                                <EyeIcon className="h-3 w-3 mr-1" />
                                                Xem chi tiết
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
