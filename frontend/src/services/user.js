import axiosInstance from "../utils/axios";

// Get all users
export const getAllUsers = async () => {
    const response = await axiosInstance.get("/api/users");
    return response.data.data;
};

// Get all users with project statistics
export const getAllUsersWithProjectStats = async () => {
    const response = await axiosInstance.get("/api/users/with-project-stats");
    return response.data.data;
};

// Search and filter users
export const searchUsers = async (searchTerm, filters = {}) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("q", searchTerm);
    if (filters.role) params.append("role", filters.role);
    if (filters.department) params.append("department", filters.department);

    const response = await axiosInstance.get(`/api/users/search?${params}`);
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

// Get user statistics
export const getUserStats = async () => {
    const response = await axiosInstance.get("/api/users/stats");
    return response.data.data;
};

// Get users by department
export const getUsersByDepartment = async (departmentId) => {
    const response = await axiosInstance.get(
        `/api/users/department/${departmentId}`
    );
    return response.data.data;
};

// Bulk update users
export const bulkUpdateUsers = async (userIds, updates) => {
    const response = await axiosInstance.put("/api/users/bulk", {
        userIds,
        updates,
    });
    return response.data;
};

// Bulk delete users
export const bulkDeleteUsers = async (userIds) => {
    const response = await axiosInstance.delete("/api/users/bulk", {
        data: { userIds },
    });
    return response.data;
};
