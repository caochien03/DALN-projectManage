import axios from "../utils/axios";

const API_URL = "/users";

export const getUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getUserById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createUser = async (userData) => {
    const response = await axios.post(API_URL, userData);
    return response.data;
};

export const updateUser = async ({ id, data }) => {
    const response = await axios.patch(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getUserTasks = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/tasks`);
    return response.data;
};

export const getUserProjects = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/projects`);
    return response.data;
};

export const getUserDepartments = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/departments`);
    return response.data;
};
