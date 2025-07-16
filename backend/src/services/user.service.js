const User = require("../models/User");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Document = require("../models/Document");
const Project = require("../models/Project");
const Department = require("../models/Department");

class UserService {
    // Create user
    static async createUser(userData) {
        const user = new User(userData);
        await user.save();
        return user;
    }

    // Update user
    static async updateUser(id, updateData) {
        const user = await User.findById(id);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        Object.assign(user, updateData);
        await user.save();
        return user;
    }

    // Delete user
    static async deleteUser(id) {
        // Cập nhật các liên kết trước khi xóa user
        await Task.updateMany({ assignedTo: id }, { assignedTo: null });
        await Comment.deleteMany({ author: id });
        await Document.deleteMany({ uploadedBy: id });
        await Project.updateMany({}, { $pull: { members: { user: id } } });

        // Xóa user
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }
        return user;
    }

    // Get all users
    static async getAllUsers() {
        return User.find()
            .select("-password")
            .populate("department", "name")
            .sort({ name: 1 });
    }

    // Get user by ID
    static async getUserById(id) {
        const user = await User.findById(id).select("-password");
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }
        return user;
    }

    // Get all users with search and filter
    static async searchUsers(searchTerm, filters = {}) {
        const query = {};

        // Search by name or email
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
            ];
        }

        // Apply filters
        if (filters.role) {
            query.role = filters.role;
        }

        if (filters.department) {
            query.department = filters.department;
        }

        const users = await User.find(query)
            .select("-password")
            .populate("department", "name")
            .sort({ name: 1 });

        // Get project statistics for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const projectStats = await this.getUserProjectStats(user._id);
                return {
                    ...user.toObject(),
                    projectStats,
                };
            })
        );

        return usersWithStats;
    }

    // Get user notifications
    static async getUserNotifications(userId) {
        const user = await User.findById(userId).populate(
            "notifications.relatedTo"
        );
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }
        return user.notifications;
    }

    // Mark notification as read
    static async markNotificationAsRead(userId, notificationId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        const notification = user.notifications.id(notificationId);
        if (!notification) {
            throw new Error("Không tìm thấy thông báo");
        }

        notification.read = true;
        await user.save();
        return notification;
    }

    // Get user tasks
    static async getUserTasks(userId) {
        const user = await User.findById(userId).populate({
            path: "tasks",
            populate: {
                path: "project",
                select: "name",
            },
        });
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }
        return user.tasks;
    }

    // Get user projects
    static async getUserProjects(userId) {
        // Tìm tất cả projects mà user tham gia
        const projects = await Project.find({
            $or: [
                { "members.user": userId },
                { pendingMembers: userId },
                { createdBy: userId },
                { manager: userId },
            ],
        }).populate("department", "name");

        if (!projects) {
            throw new Error("Không tìm thấy người dùng");
        }
        return projects;
    }

    // Upload avatar
    static async uploadAvatar(userId, avatarPath) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        user.avatar = avatarPath;
        await user.save();
        return user.avatar;
    }

    // Get user statistics
    static async getUserStats() {
        const [totalUsers, adminCount, managerCount, memberCount] =
            await Promise.all([
                User.countDocuments(),
                User.countDocuments({ role: "admin" }),
                User.countDocuments({ role: "manager" }),
                User.countDocuments({ role: "member" }),
            ]);

        return {
            total: totalUsers,
            byRole: {
                admin: adminCount,
                manager: managerCount,
                member: memberCount,
            },
        };
    }

    // Get user project statistics
    static async getUserProjectStats(userId) {
        // Tìm tất cả projects mà user tham gia (cả trong members và pendingMembers)
        const projects = await Project.find({
            $or: [
                { "members.user": userId },
                { pendingMembers: userId },
                { createdBy: userId },
                { manager: userId },
            ],
        }).select("name status");

        const completedProjects = projects.filter(
            (project) => project.status === "close"
        ).length;
        const activeProjects = projects.filter(
            (project) => project.status === "open"
        ).length;

        return {
            total: projects.length,
            completed: completedProjects,
            active: activeProjects,
        };
    }

    // Get all users with project statistics
    static async getAllUsersWithProjectStats() {
        const users = await User.find()
            .select("-password")
            .populate("department", "name")
            .sort({ name: 1 });

        // Get project statistics for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const projectStats = await this.getUserProjectStats(user._id);
                return {
                    ...user.toObject(),
                    projectStats,
                };
            })
        );

        return usersWithStats;
    }

    // Get users by department
    static async getUsersByDepartment(departmentId) {
        return User.find({ department: departmentId })
            .select("-password")
            .populate("department", "name")
            .sort({ name: 1 });
    }

    // Bulk update users
    static async bulkUpdateUsers(userIds, updates) {
        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: updates }
        );
        return result;
    }

    // Bulk delete users
    static async bulkDeleteUsers(userIds) {
        // Cập nhật các liên kết trước khi xóa users
        await Task.updateMany(
            { assignedTo: { $in: userIds } },
            { assignedTo: null }
        );
        await Comment.deleteMany({ author: { $in: userIds } });
        await Document.deleteMany({ uploadedBy: { $in: userIds } });
        await Project.updateMany(
            {},
            { $pull: { members: { user: { $in: userIds } } } }
        );

        const result = await User.deleteMany({ _id: { $in: userIds } });
        return result;
    }
}

module.exports = UserService;
