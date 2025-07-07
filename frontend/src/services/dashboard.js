import axiosInstance from "../utils/axios";

class DashboardService {
    // Get all dashboard data
    static async getAllDashboardData() {
        const response = await axiosInstance.get("/api/dashboard");
        return response.data;
    }

    // Get overall statistics
    static async getOverallStats() {
        const response = await axiosInstance.get("/api/dashboard/stats");
        return response.data;
    }

    // Get recent activities
    static async getRecentActivities(limit = 10) {
        const response = await axiosInstance.get(
            `/api/dashboard/activities?limit=${limit}`
        );
        return response.data;
    }

    // Get projects near deadline
    static async getProjectsNearDeadline(days = 7) {
        const response = await axiosInstance.get(
            `/api/dashboard/projects-near-deadline?days=${days}`
        );
        return response.data;
    }

    // Get department statistics
    static async getDepartmentStats() {
        const response = await axiosInstance.get(
            "/api/dashboard/department-stats"
        );
        return response.data;
    }

    // Get user performance statistics
    static async getUserPerformanceStats() {
        const response = await axiosInstance.get(
            "/api/dashboard/user-performance"
        );
        return response.data;
    }
}

export default DashboardService;
