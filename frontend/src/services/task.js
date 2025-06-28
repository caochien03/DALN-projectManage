import axiosInstance from "../utils/axios";
import { triggerNewNotification } from "../utils/notificationUtils";

export const createTask = async (taskData) => {
    const response = await axiosInstance.post("/api/tasks", taskData);
    // Trigger notification event khi tạo task mới
    triggerNewNotification();
    return response.data;
};

export const updateTask = async (taskId, taskData) => {
    const response = await axiosInstance.put(`/api/tasks/${taskId}`, taskData);
    // Trigger notification event khi cập nhật task
    triggerNewNotification();
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
    return response.data;
};

// Lấy task detail theo ID
export const getTaskById = async (taskId) => {
    const response = await axiosInstance.get(`/api/tasks/${taskId}`);
    return response.data.data;
};

// Nếu có hàm getAllTasks/getTaskById thì trả về response.data.data
export const getAllTasks = async () => {
    const response = await axiosInstance.get("/api/tasks");
    return response.data.data;
};
