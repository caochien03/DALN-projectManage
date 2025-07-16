const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Department = require("../models/Department");

class DashboardService {
    // Get overall statistics
    static async getOverallStats() {
        try {
            const [
                totalUsers,
                totalProjects,
                totalTasks,
                totalDepartments,
                usersByRole,
                projectsByStatus,
                tasksByStatus,
                overdueTasks,
            ] = await Promise.all([
                User.countDocuments(),
                Project.countDocuments(),
                Task.countDocuments(),
                Department.countDocuments(),
                User.aggregate([
                    {
                        $group: {
                            _id: "$role",
                            count: { $sum: 1 },
                        },
                    },
                ]),
                Project.aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ]),
                Task.aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ]),
                Task.countDocuments({
                    dueDate: { $lt: new Date() },
                    status: { $ne: "completed" },
                }),
            ]);

            // Convert arrays to objects for easier frontend consumption
            const usersByRoleObj = usersByRole.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            const projectsByStatusObj = projectsByStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            const tasksByStatusObj = tasksByStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            return {
                overview: {
                    totalUsers,
                    totalProjects,
                    totalTasks,
                    totalDepartments,
                },
                users: {
                    byRole: {
                        admin: usersByRoleObj.admin || 0,
                        manager: usersByRoleObj.manager || 0,
                        member: usersByRoleObj.member || 0,
                    },
                },
                projects: {
                    byStatus: {
                        open: projectsByStatusObj.open || 0,
                        close: projectsByStatusObj.close || 0,
                    },
                },
                tasks: {
                    byStatus: {
                        pending: tasksByStatusObj.pending || 0,
                        in_progress: tasksByStatusObj.in_progress || 0,
                        completed: tasksByStatusObj.completed || 0,
                    },
                    overdue: overdueTasks,
                },
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê dashboard: ${error.message}`);
        }
    }

    // Get recent activities
    static async getRecentActivities(limit = 10) {
        try {
            const recentProjects = await Project.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate("createdBy", "name")
                .populate("departments", "name")
                .select("name status createdAt createdBy departments");

            const recentTasks = await Task.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate("project", "name")
                .populate("assignedTo", "name")
                .select("title status priority createdAt project assignedTo");

            const recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate("department", "name")
                .select("name email role department createdAt");

            return {
                recentProjects,
                recentTasks,
                recentUsers,
            };
        } catch (error) {
            throw new Error(
                `Error getting recent activities: ${error.message}`
            );
        }
    }

    // Get projects near deadline
    static async getProjectsNearDeadline(days = 7) {
        try {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + days);

            const projects = await Project.find({
                endDate: { $lte: deadline, $gte: new Date() },
                status: "open",
            })
                .populate("createdBy", "name")
                .populate("departments", "name")
                .select("name endDate progress createdBy departments")
                .sort({ endDate: 1 });

            return projects;
        } catch (error) {
            throw new Error(
                `Error getting projects near deadline: ${error.message}`
            );
        }
    }

    // Get department statistics
    static async getDepartmentStats() {
        try {
            const departments = await Department.find();

            const departmentStats = await Promise.all(
                departments.map(async (dept) => {
                    // Get member count using virtual
                    const memberCount = await User.countDocuments({
                        department: dept._id,
                    });

                    const projectCount = await Project.countDocuments({
                        departments: dept._id,
                    });

                    // Get project IDs for this department
                    const projectIds = await Project.find({
                        departments: dept._id,
                    }).select("_id");

                    const taskCount = await Task.countDocuments({
                        project: { $in: projectIds.map((p) => p._id) },
                    });

                    return {
                        _id: dept._id,
                        name: dept.name,
                        memberCount,
                        projectCount,
                        taskCount,
                    };
                })
            );

            return departmentStats;
        } catch (error) {
            throw new Error(`Error getting department stats: ${error.message}`);
        }
    }

    // Get user performance stats
    static async getUserPerformanceStats() {
        try {
            const users = await User.find()
                .populate("department", "name")
                .select("name email role department");

            const userStats = await Promise.all(
                users.map(async (user) => {
                    // Get projects where user is member, creator, or manager
                    const projects = await Project.find({
                        $or: [
                            { "members.user": user._id },
                            { createdBy: user._id },
                            { manager: user._id },
                        ],
                    });

                    // Get tasks assigned to user
                    const tasks = await Task.find({ assignedTo: user._id });

                    const completedTasks = tasks.filter(
                        (task) => task.status === "completed"
                    ).length;
                    const totalTasks = tasks.length;
                    const completionRate =
                        totalTasks > 0
                            ? Math.round((completedTasks / totalTasks) * 100)
                            : 0;

                    return {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        department: user.department,
                        projectCount: projects.length,
                        taskCount: totalTasks,
                        completedTasks,
                        completionRate,
                    };
                })
            );

            return userStats;
        } catch (error) {
            throw new Error(
                `Error getting user performance stats: ${error.message}`
            );
        }
    }
}

module.exports = DashboardService;
