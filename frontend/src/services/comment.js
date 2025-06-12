import axiosInstance from "../utils/axios";

// Task comments
export const getTaskComments = async (taskId) => {
    const res = await axiosInstance.get(`/api/tasks/${taskId}/comments`);
    return res.data;
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
    return res.data;
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
