import axiosInstance from "../utils/axios";

// Get all projects
export const getAllProjects = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) {
        params.append("search", filters.search);
    }
    if (filters.department) {
        params.append("department", filters.department);
    }

    const response = await axiosInstance.get(`/api/projects?${params}`);
    return response.data.data;
};

// Create project
export const createProject = async (projectData) => {
    const response = await axiosInstance.post("/api/projects", projectData);
    return response.data;
};

// Update project
export const updateProject = async (projectId, projectData) => {
    const response = await axiosInstance.put(
        `/api/projects/${projectId}`,
        projectData
    );
    return response.data;
};

// Delete project
export const deleteProject = async (projectId) => {
    const response = await axiosInstance.delete(`/api/projects/${projectId}`);
    return response.data;
};

// Lấy thông tin chi tiết project
export const getProjectById = async (id) => {
    const response = await axiosInstance.get(`/api/projects/${id}`);
    return response.data.data;
};

// Xác nhận hoàn thành project
export const completeProject = async (id) => {
    const response = await axiosInstance.put(`/api/projects/${id}/complete`);
    return response.data;
};

// Xác nhận hoàn thành milestone
export const completeMilestone = async (projectId, milestoneId) => {
    const response = await axiosInstance.put(
        `/api/projects/${projectId}/milestones/${milestoneId}/complete`
    );
    return response.data;
};

// Kiểm tra tính nhất quán của milestone
export const checkMilestoneConsistency = async (projectId, milestoneId) => {
    const response = await axiosInstance.get(
        `/api/projects/${projectId}/milestones/${milestoneId}/check-consistency`
    );
    return response.data;
};

export const registerForProject = async (projectId) => {
    const response = await axiosInstance.post(
        `/api/projects/${projectId}/register`
    );
    return response.data;
};

export const approveMember = async (projectId, userId) => {
    const response = await axiosInstance.post(
        `/api/projects/${projectId}/approve/${userId}`
    );
    return response.data;
};

export const rejectMember = async (projectId, userId) => {
    const response = await axiosInstance.post(
        `/api/projects/${projectId}/reject/${userId}`
    );
    return response.data;
};

// Tạo milestone mới
export const createMilestone = async (projectId, milestoneData) => {
    const response = await axiosInstance.post(
        `/api/projects/${projectId}/milestones`,
        milestoneData
    );
    return response.data;
};

// Cập nhật milestone
export const updateMilestone = async (
    projectId,
    milestoneId,
    milestoneData
) => {
    const response = await axiosInstance.put(
        `/api/projects/${projectId}/milestones/${milestoneId}`,
        milestoneData
    );
    return response.data;
};

// Xóa milestone
export const deleteMilestone = async (projectId, milestoneId) => {
    const response = await axiosInstance.delete(
        `/api/projects/${projectId}/milestones/${milestoneId}`
    );
    return response.data;
};

// Lấy lịch sử thay đổi dự án
export const getProjectActivity = async (projectId) => {
    const response = await axiosInstance.get(
        `/api/projects/${projectId}/activity`
    );
    return response.data.data;
};
