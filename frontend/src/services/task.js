import axios from "../utils/axios";

const API_URL = "/tasks";

export const getTasks = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getTasksByProject = async (projectId) => {
    const response = await axios.get(`${API_URL}/project/${projectId}`);
    return response.data;
};

export const getTaskById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await axios.post(API_URL, taskData);
    return response.data;
};

export const updateTask = async ({ id, data }) => {
    const response = await axios.patch(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getTasksByStatus = async (status) => {
    const response = await axios.get(`${API_URL}/status/${status}`);
    return response.data;
};

export const getOverdueTasks = async () => {
    const response = await axios.get(`${API_URL}/overdue`);
    return response.data;
};

export const addComment = async ({ id, content }) => {
    const response = await axios.post(`${API_URL}/${id}/comments`, { content });
    return response.data;
};

export const getTaskComments = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/comments`);
    return response.data;
};
