import axiosInstance from "../utils/axios";

// Task comments
export const getTaskComments = async (taskId) => {
    const res = await axiosInstance.get(`/api/tasks/${taskId}/comments`);
    return res.data.data;
};

export const addTaskComment = async (taskId, content, mentions = []) => {
    const res = await axiosInstance.post(`/api/tasks/${taskId}/comments`, {
        content,
        mentions,
    });
    return res.data;
};

// Project comments
export const getProjectComments = async (projectId) => {
    const res = await axiosInstance.get(`/api/projects/${projectId}/comments`);
    return res.data.data;
};

export const addProjectComment = async (projectId, content, mentions = []) => {
    const res = await axiosInstance.post(
        `/api/projects/${projectId}/comments`,
        { content, mentions }
    );
    return res.data;
};

export const deleteComment = async (commentId) => {
    const res = await axiosInstance.delete(`/api/comments/${commentId}`);
    return res.data;
};

// Lấy comment detail theo ID
export const getCommentById = async (commentId) => {
    const response = await axiosInstance.get(`/api/comments/${commentId}`);
    return response.data.data;
};

// Lấy comments theo project
export const getCommentsByProject = async (projectId) => {
    const response = await axiosInstance.get(
        `/api/comments/project/${projectId}`
    );
    return response.data.data;
};

// Lấy comments theo task
export const getCommentsByTask = async (taskId) => {
    const response = await axiosInstance.get(`/api/comments/task/${taskId}`);
    return response.data.data;
};

// Thêm comment mới
export const addComment = async (commentData) => {
    const response = await axiosInstance.post("/api/comments", commentData);
    return response.data;
};
