import React, { createContext, useContext, useState, useEffect } from "react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationPopup from "./NotificationPopup";

const NotificationContext = createContext();

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotificationContext must be used within a NotificationProvider"
        );
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const notificationState = useNotifications();

    // Gói lại removePopupNotification để log
    const removePopupNotificationWithLog = (notificationId) => {
        console.log(
            "[NotificationContext] removePopupNotification:",
            notificationId
        );
        notificationState.removePopupNotification(notificationId);
    };

    useEffect(() => {
        // Kiểm tra xem user đã đăng nhập chưa
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
        };

        // Kiểm tra lần đầu
        checkAuth();

        // Lắng nghe sự thay đổi của localStorage
        const handleStorageChange = (e) => {
            if (e.key === "token") {
                checkAuth();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        // Lắng nghe custom event khi token thay đổi
        const handleTokenChange = () => {
            checkAuth();
        };

        window.addEventListener("tokenChanged", handleTokenChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("tokenChanged", handleTokenChange);
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                ...notificationState,
                removePopupNotification: removePopupNotificationWithLog,
            }}
        >
            {children}

            {/* Chỉ render popup notifications khi đã đăng nhập */}
            {isAuthenticated && (
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notificationState.popupNotifications.map(
                        (notification) => (
                            <NotificationPopup
                                key={notification._id}
                                notification={notification}
                                onClose={() =>
                                    removePopupNotificationWithLog(
                                        notification._id
                                    )
                                }
                                onMarkAsRead={notificationState.markAsRead}
                            />
                        )
                    )}
                </div>
            )}
        </NotificationContext.Provider>
    );
};
