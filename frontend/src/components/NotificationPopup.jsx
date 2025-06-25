import React, { useEffect } from "react";
import { XMarkIcon, BellIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { getTaskById } from "../services/task";
import { getCommentById } from "../services/comment";
import { getDocumentById } from "../services/document";

const NotificationPopup = ({ notification, onClose, onMarkAsRead }) => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log(
            "[NotificationPopup] useEffect mounted for:",
            notification._id,
            notification.message
        );
        // Tự động tắt hoàn toàn sau 5 giây
        const timer = setTimeout(() => {
            console.log(
                "[NotificationPopup] Auto onClose after 5s:",
                notification._id,
                notification.message
            );
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose, notification._id, notification.message]);

    const handleClick = async () => {
        if (!notification.read) {
            onMarkAsRead(notification._id);
        }

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

        console.log(
            "[NotificationPopup] onClose by click (chi tiết/x):",
            notification._id,
            notification.message
        );
        onClose();
    };

    const handleManualClose = () => {
        console.log(
            "[NotificationPopup] onClose by X button:",
            notification._id,
            notification.message
        );
        onClose();
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

    return (
        <div className="fixed top-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 ease-in-out">
            <div className="p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationColor(
                                    notification.type
                                )}`}
                            >
                                {notification.type.replace("_", " ")}
                            </span>
                            <button
                                onClick={handleManualClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-900">
                            {notification.message}
                        </p>
                        {notification.relatedTo && (
                            <button
                                onClick={handleClick}
                                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Xem chi tiết →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;
