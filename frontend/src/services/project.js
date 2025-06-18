import axiosInstance from "../utils/axios";

// Get all projects
export const getAllProjects = async () => {
    const response = await axiosInstance.get("/api/projects");
    return response.data;
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
    return response.data;
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
