import axiosInstance from "../utils/axios";

// Get all departments
export const getAllDepartments = async () => {
    const response = await axiosInstance.get(`/api/departments`);
    return response.data.data;
};

// Search departments
export const searchDepartments = async (searchTerm) => {
    const response = await axiosInstance.get(
        `/api/departments/search?q=${encodeURIComponent(searchTerm)}`
    );
    return response.data.data;
};

// Get department by ID
export const getDepartmentById = async (departmentId) => {
    const response = await axiosInstance.get(
        `/api/departments/${departmentId}`
    );
    return response.data.data;
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
export const deleteDepartment = async (
    departmentId,
    force = false,
    userAction = "null"
) => {
    const params = new URLSearchParams();
    if (force) params.append("force", "true");
    if (userAction) params.append("userAction", userAction);

    const response = await axiosInstance.delete(
        `/api/departments/${departmentId}?${params.toString()}`
    );
    return response.data;
};

// Get department members
export const getDepartmentMembers = async (departmentId) => {
    const response = await axiosInstance.get(
        `/api/departments/${departmentId}/members`
    );
    return response.data.data;
};

// Get department statistics
export const getDepartmentStats = async (departmentId) => {
    const response = await axiosInstance.get(
        `/api/departments/${departmentId}/stats`
    );
    return response.data.data;
};

// Get department by name
export const getDepartmentByName = async (name) => {
    const response = await axiosInstance.get(
        `/api/departments/search?q=${encodeURIComponent(name)}`
    );
    const departments = response.data.data;
    return departments.find(
        (dept) => dept.name.toLowerCase() === name.toLowerCase()
    );
};
