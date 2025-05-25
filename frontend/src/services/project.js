import axios from "../utils/axios";

const API_URL = "/projects";

export const getProjects = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getProjectById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createProject = async (projectData) => {
    const response = await axios.post(API_URL, projectData);
    return response.data;
};

export const updateProject = async ({ id, data }) => {
    const response = await axios.patch(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getProjectMembers = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/members`);
    return response.data;
};

export const addProjectMember = async ({ id, userId }) => {
    const response = await axios.post(`${API_URL}/${id}/members`, { userId });
    return response.data;
};

export const removeProjectMember = async ({ id, userId }) => {
    const response = await axios.delete(`${API_URL}/${id}/members/${userId}`);
    return response.data;
};
