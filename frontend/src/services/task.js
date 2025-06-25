import axiosInstance from "../utils/axios";

export const createTask = async (taskData) => {
    const response = await axiosInstance.post("/api/tasks", taskData);
    return response.data;
};

export const updateTask = async (taskId, taskData) => {
    const response = await axiosInstance.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
    return response.data;
};

// Lấy task detail theo ID
export const getTaskById = async (taskId) => {
    const response = await axiosInstance.get(`/api/tasks/${taskId}`);
    return response.data;
};
