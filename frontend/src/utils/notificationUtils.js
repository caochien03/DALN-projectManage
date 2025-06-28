// Utility function để trigger event khi có notification mới
export const triggerNewNotification = () => {
    console.log("[notificationUtils] Triggering new notification event");
    window.dispatchEvent(new CustomEvent("newNotification"));
};

// Utility function để cập nhật badge count ngay lập tức
export const updateBadgeCount = (count) => {
    console.log("[notificationUtils] Updating badge count to:", count);
    window.dispatchEvent(
        new CustomEvent("updateBadgeCount", { detail: { count } })
    );
};
