import axiosInstance from "../utils/axios";

// Login
export const login = async (email, password) => {
    const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
    });
    localStorage.setItem("token", response.data.token);
    // Dispatch event để thông báo token đã thay đổi
    window.dispatchEvent(new Event("tokenChanged"));
    return response.data;
};

// Logout
export const logout = () => {
    localStorage.removeItem("token");
    // Dispatch event để thông báo token đã thay đổi
    window.dispatchEvent(new Event("tokenChanged"));
};

// Change Password
export const changePassword = async (currentPassword, newPassword) => {
    const response = await axiosInstance.put("/api/auth/password", {
        currentPassword,
        newPassword,
    });
    return response.data;
};

// Forgot Password
export const forgotPassword = async (email) => {
    const response = await axiosInstance.post("/api/auth/forgot-password", {
        email,
    });
    return response.data;
};

// Get current user
export const getCurrentUser = async () => {
    const response = await axiosInstance.get("/api/auth/me");
    return response.data.data;
};

// Update profile
export const updateProfile = async (profileData) => {
    const response = await axiosInstance.put("/api/auth/profile", profileData);
    return response.data;
};
