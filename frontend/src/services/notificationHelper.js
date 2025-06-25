import axiosInstance from "../utils/axios";

// Tạo thông báo cho task được giao
export const createTaskAssignedNotification = async (taskId, assignedToId) => {
    try {
        const response = await axiosInstance.post("/api/notifications", {
            user: assignedToId,
            type: "task_assigned",
            message: `Bạn đã được giao task mới`,
            relatedTo: taskId,
            onModel: "Task",
        });
        return response.data;
    } catch (error) {
        console.error("Error creating task assigned notification:", error);
    }
};

// Tạo thông báo cho task sắp đến hạn
export const createTaskDueNotification = async (taskId, assignedToId) => {
    try {
        const response = await axiosInstance.post("/api/notifications", {
            user: assignedToId,
            type: "task_due",
            message: `Task của bạn sắp đến hạn`,
            relatedTo: taskId,
            onModel: "Task",
        });
        return response.data;
    } catch (error) {
        console.error("Error creating task due notification:", error);
    }
};

// Tạo thông báo cho cập nhật trạng thái task
export const createTaskStatusUpdateNotification = async (
    taskId,
    assignedToId,
    newStatus
) => {
    try {
        const response = await axiosInstance.post("/api/notifications", {
            user: assignedToId,
            type: "task_status_update",
            message: `Task đã được cập nhật trạng thái thành ${newStatus}`,
            relatedTo: taskId,
            onModel: "Task",
        });
        return response.data;
    } catch (error) {
        console.error("Error creating task status update notification:", error);
    }
};

// Tạo thông báo cho comment mới
export const createNewCommentNotification = async (
    commentId,
    taskId,
    mentionedUsers
) => {
    try {
        const notifications = mentionedUsers.map((userId) => ({
            user: userId,
            type: "mention",
            message: `Bạn được nhắc đến trong một comment`,
            relatedTo: commentId,
            onModel: "Comment",
        }));

        await Promise.all(
            notifications.map((notification) =>
                axiosInstance.post("/api/notifications", notification)
            )
        );
    } catch (error) {
        console.error("Error creating comment notification:", error);
    }
};

// Tạo thông báo cho document mới
export const createNewDocumentNotification = async (
    documentId,
    projectId,
    projectMembers
) => {
    try {
        const notifications = projectMembers.map((memberId) => ({
            user: memberId,
            type: "new_document",
            message: `Tài liệu mới đã được thêm vào dự án`,
            relatedTo: documentId,
            onModel: "Document",
        }));

        await Promise.all(
            notifications.map((notification) =>
                axiosInstance.post("/api/notifications", notification)
            )
        );
    } catch (error) {
        console.error("Error creating document notification:", error);
    }
};

// Tạo thông báo cho user được thêm vào project
export const createAddedToProjectNotification = async (projectId, userId) => {
    try {
        const response = await axiosInstance.post("/api/notifications", {
            user: userId,
            type: "added_to_project",
            message: `Bạn đã được thêm vào dự án mới`,
            relatedTo: projectId,
            onModel: "Project",
        });
        return response.data;
    } catch (error) {
        console.error("Error creating added to project notification:", error);
    }
};

// Tạo thông báo cho user được thêm vào department
export const createAddedToDepartmentNotification = async (
    departmentId,
    userId
) => {
    try {
        const response = await axiosInstance.post("/api/notifications", {
            user: userId,
            type: "added_to_department",
            message: `Bạn đã được thêm vào phòng ban mới`,
            relatedTo: departmentId,
            onModel: "Department",
        });
        return response.data;
    } catch (error) {
        console.error(
            "Error creating added to department notification:",
            error
        );
    }
};

// Tạo thông báo cho yêu cầu phê duyệt
export const createApprovalRequestNotification = async (
    requestId,
    approverId
) => {
    try {
        const response = await axiosInstance.post("/api/notifications", {
            user: approverId,
            type: "approval_request",
            message: `Bạn có yêu cầu phê duyệt mới cần xử lý`,
            relatedTo: requestId,
            onModel: "Project",
        });
        return response.data;
    } catch (error) {
        console.error("Error creating approval request notification:", error);
    }
};

// Tạo thông báo cho project sắp đến hạn
export const createProjectDueNotification = async (
    projectId,
    projectMembers
) => {
    try {
        const notifications = projectMembers.map((memberId) => ({
            user: memberId,
            type: "task_due",
            message: `Dự án sắp đến hạn hoàn thành`,
            relatedTo: projectId,
            onModel: "Project",
        }));

        await Promise.all(
            notifications.map((notification) =>
                axiosInstance.post("/api/notifications", notification)
            )
        );
    } catch (error) {
        console.error("Error creating project due notification:", error);
    }
};

// Tạo thông báo cho milestone hoàn thành
export const createMilestoneCompletedNotification = async (
    projectId,
    milestoneName,
    projectMembers
) => {
    try {
        const notifications = projectMembers.map((memberId) => ({
            user: memberId,
            type: "task_status_update",
            message: `Milestone "${milestoneName}" đã được hoàn thành`,
            relatedTo: projectId,
            onModel: "Project",
        }));

        await Promise.all(
            notifications.map((notification) =>
                axiosInstance.post("/api/notifications", notification)
            )
        );
    } catch (error) {
        console.error(
            "Error creating milestone completed notification:",
            error
        );
    }
};

export default {
    createTaskAssignedNotification,
    createTaskDueNotification,
    createTaskStatusUpdateNotification,
    createNewCommentNotification,
    createNewDocumentNotification,
    createAddedToProjectNotification,
    createAddedToDepartmentNotification,
    createApprovalRequestNotification,
    createProjectDueNotification,
    createMilestoneCompletedNotification,
};
