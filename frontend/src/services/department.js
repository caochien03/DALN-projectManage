import axiosInstance from "../utils/axios";

// Get all departments
export const getAllDepartments = async () => {
    const response = await axiosInstance.get("/api/departments");
    return response.data;
};

// Create department
export const createDepartment = async (departmentData) => {
    const response = await axiosInstance.post(
        "/api/departments",
        departmentData
    );
    return response.data;
};

// Update department
export const updateDepartment = async (departmentId, departmentData) => {
    const response = await axiosInstance.put(
        `/api/departments/${departmentId}`,
        departmentData
    );
    return response.data;
};

// Delete department
export const deleteDepartment = async (departmentId) => {
    const response = await axiosInstance.delete(
        `/api/departments/${departmentId}`
    );
    return response.data;
};
