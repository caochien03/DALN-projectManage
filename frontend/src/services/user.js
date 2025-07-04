import axiosInstance from "../utils/axios";

// Get all users
export const getAllUsers = async () => {
    const response = await axiosInstance.get("/api/users");
    return response.data.data;
};

// Create user
export const createUser = async (userData) => {
    const response = await axiosInstance.post("/api/users", userData);
    return response.data;
};

// Update user
export const updateUser = async (userId, userData) => {
    const response = await axiosInstance.put(`/api/users/${userId}`, userData);
    return response.data;
};

// Delete user
export const deleteUser = async (userId) => {
    const response = await axiosInstance.delete(`/api/users/${userId}`);
    return response.data;
};

// Lấy các project mà user tham gia
export const getUserProjects = async () => {
    const response = await axiosInstance.get("/api/users/projects");
    return response.data.data;
};

// Lấy các task của user
export const getUserTasks = async () => {
    const response = await axiosInstance.get("/api/users/tasks");
    return response.data.data;
};

export async function uploadProfileAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await axiosInstance.put("/api/auth/profile/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}
