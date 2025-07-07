const DashboardService = require("../services/dashboard.service");

class DashboardController {
    // Get overall dashboard statistics
    static async getOverallStats(req, res) {
        try {
            const stats = await DashboardService.getOverallStats();
            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get recent activities
    static async getRecentActivities(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const activities = await DashboardService.getRecentActivities(
                limit
            );
            res.json({
                success: true,
                data: activities,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get projects near deadline
    static async getProjectsNearDeadline(req, res) {
        try {
            const days = parseInt(req.query.days) || 7;
            const projects = await DashboardService.getProjectsNearDeadline(
                days
            );
            res.json({
                success: true,
                data: projects,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get department statistics
    static async getDepartmentStats(req, res) {
        try {
            const stats = await DashboardService.getDepartmentStats();
            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get user performance statistics
    static async getUserPerformanceStats(req, res) {
        try {
            const stats = await DashboardService.getUserPerformanceStats();
            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get all dashboard data in one request
    static async getAllDashboardData(req, res) {
        try {
            const [
                overallStats,
                recentActivities,
                projectsNearDeadline,
                departmentStats,
                userPerformanceStats,
            ] = await Promise.all([
                DashboardService.getOverallStats(),
                DashboardService.getRecentActivities(5),
                DashboardService.getProjectsNearDeadline(7),
                DashboardService.getDepartmentStats(),
                DashboardService.getUserPerformanceStats(),
            ]);

            res.json({
                success: true,
                data: {
                    overallStats,
                    recentActivities,
                    projectsNearDeadline,
                    departmentStats,
                    userPerformanceStats,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

module.exports = DashboardController;
