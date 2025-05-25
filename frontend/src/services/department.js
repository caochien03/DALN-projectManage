import axios from "../utils/axios";

const API_URL = "/departments";

export const getDepartments = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getDepartmentById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createDepartment = async (departmentData) => {
    const response = await axios.post(API_URL, departmentData);
    return response.data;
};

export const updateDepartment = async ({ id, data }) => {
    const response = await axios.patch(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteDepartment = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getDepartmentMembers = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/members`);
    return response.data;
};

export const addDepartmentMember = async ({ id, userId }) => {
    const response = await axios.post(`${API_URL}/${id}/members`, { userId });
    return response.data;
};

export const removeDepartmentMember = async ({ id, userId }) => {
    const response = await axios.delete(`${API_URL}/${id}/members/${userId}`);
    return response.data;
};

export const getDepartmentStats = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/stats`);
    return response.data;
};
