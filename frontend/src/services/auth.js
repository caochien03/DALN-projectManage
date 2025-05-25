import axios from "../utils/axios";

const API_URL = "/auth";

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
};

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
};

export const updateProfile = async (userData) => {
    const response = await axios.patch(`${API_URL}/profile`, userData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await axios.patch(`${API_URL}/password`, passwordData);
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await axios.post(`${API_URL}/reset-password`, {
        token,
        newPassword,
    });
    return response.data;
};
