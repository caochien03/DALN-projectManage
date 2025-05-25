import axios from "../utils/axios";

const API_URL = "/dashboard";

export const getDashboardStats = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getRecentActivities = async () => {
    const response = await axios.get(`${API_URL}/activities`);
    return response.data;
};

export const getTaskStats = async () => {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
};

export const getProjectStats = async () => {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
};

export const getDepartmentStats = async () => {
    const response = await axios.get(`${API_URL}/departments`);
    return response.data;
};
