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
