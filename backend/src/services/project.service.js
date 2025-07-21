const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const notificationService = require("./notification.service");

class ProjectService {
    static async createProject(projectData) {
        const project = new Project(projectData);
        await project.save();
        return project;
    }

    static async getAllProjects(filters = {}) {
        const { search, department } = filters;

        let query = Project.find();

        // Search filter
        if (search) {
            query = query.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ],
            });
        }

        // Department filter
        if (department) {
            query = query.find({ departments: department });
        }

        return query
            .populate("createdBy", "name email")
            .populate("members.user", "name email position")
            .populate("departments", "name");
    }

    static async getProjectById(id) {
        return Project.findById(id)
            .populate("createdBy", "name email")
            .populate("members.user", "name email position")
            .populate("tasks")
            .populate("manager", "name email position");
    }

    static async updateProject(id, updates) {
        const project = await Project.findById(id);
        if (!project) {
            return null;
        }

        Object.keys(updates).forEach(
            (update) => (project[update] = updates[update])
        );
        await project.save();
        return project;
    }

    static async addMember(projectId, memberData) {
        const project = await Project.findById(projectId);
        if (!project) {
            return null;
        }

        project.members.push(memberData);
        await project.save();

        // Tạo thông báo cho user được thêm vào project
        await notificationService.createNotification({
            user: memberData.user,
            type: "added_to_project",
            message: `Bạn đã được thêm vào dự án: ${project.name}`,
            relatedTo: project._id,
            onModel: "Project",
        });

        return project;
    }

    static async removeMember(projectId, memberId) {
        const project = await Project.findById(projectId);
        if (!project) {
            return null;
        }

        project.members = project.members.filter(
            (member) => member.user.toString() !== memberId
        );
        await project.save();
        return project;
    }

    static async getProjectProgress(projectId) {
        const project = await Project.findById(projectId);
        if (!project) {
            return null;
        }

        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(
            (task) => task.status === "completed"
        ).length;
        return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    }

    static async deleteProject(id) {
        return Project.findByIdAndDelete(id);
    }

    // Đăng ký tham gia dự án
    static async registerForProject(projectId, userId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }
        if (project.status !== "open") {
            throw new Error("Dự án không mở để đăng ký");
        }
        const user = await User.findById(userId);
        const isEligible = project.departments.some((dept) =>
            dept.equals(user.department)
        );
        if (!isEligible) {
            throw new Error(
                "You are not eligible to register for this project"
            );
        }
        if (
            project.members.includes(userId) ||
            project.pendingMembers.includes(userId)
        ) {
            throw new Error("Bạn đã đăng ký tham gia dự án này");
        }
        project.pendingMembers.push(userId);
        await project.save();
        return { message: "Registration successful, waiting for approval" };
    }

    // Duyệt nhân viên tham gia dự án
    static async approveMember(projectId, userId, managerId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }
        if (!project.createdBy.equals(managerId)) {
            throw new Error("Chỉ quản lý dự án mới có thể duyệt thành viên");
        }
        if (!project.pendingMembers.includes(userId)) {
            throw new Error("Người dùng không có trong danh sách chờ duyệt");
        }
        project.pendingMembers = project.pendingMembers.filter(
            (id) => !id.equals(userId)
        );
        project.members.push({ user: userId, role: "member" });
        await project.save();

        // Tạo thông báo cho user được duyệt
        await notificationService.createNotification({
            user: userId,
            type: "added_to_project",
            message: `Yêu cầu tham gia dự án "${project.name}" đã được duyệt`,
            relatedTo: project._id,
            onModel: "Project",
        });

        return { message: "Member approved successfully" };
    }

    // Từ chối nhân viên tham gia dự án
    static async rejectMember(projectId, userId, managerId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }
        if (!project.createdBy.equals(managerId)) {
            throw new Error("Chỉ quản lý dự án mới có thể từ chối thành viên");
        }
        if (!project.pendingMembers.includes(userId)) {
            throw new Error("User is not in the pending list");
        }
        project.pendingMembers = project.pendingMembers.filter(
            (id) => !id.equals(userId)
        );
        await project.save();
        return { message: "Member rejected successfully" };
    }

    // Kiểm tra và cập nhật trạng thái milestone
    static async checkMilestoneConsistency(projectId, milestoneId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }

        const milestone = project.milestones.id(milestoneId);
        if (!milestone) {
            throw new Error("Không tìm thấy mốc (milestone)");
        }

        if (milestone.status === "completed") {
            // Kiểm tra tất cả task trong milestone
            const tasks = await Task.find({
                project: projectId,
                milestone: milestoneId,
            });

            const hasIncompleteTask = tasks.some(
                (task) => task.status !== "completed"
            );

            if (hasIncompleteTask) {
                // Cập nhật status của milestone
                milestone.status = "pending";
                milestone.completedAt = null;
                milestone.completedBy = null;
                await project.save();

                return {
                    updated: true,
                    message:
                        "Milestone status updated to pending due to incomplete tasks",
                };
            }
        }

        return {
            updated: false,
            message: "Milestone status is consistent",
        };
    }

    // Xác nhận hoàn thành milestone
    static async completeMilestone(projectId, milestoneId, userId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }

        const milestone = project.milestones.id(milestoneId);
        if (!milestone) {
            throw new Error("Không tìm thấy mốc (milestone)");
        }

        // Kiểm tra tất cả task trong milestone
        const tasks = await Task.find({
            project: projectId,
            milestone: milestoneId,
        });

        const hasIncompleteTask = tasks.some(
            (task) => task.status !== "completed"
        );

        if (hasIncompleteTask) {
            throw new Error(
                "Cannot complete milestone: there are incomplete tasks"
            );
        }

        // Cập nhật status của milestone
        milestone.status = "completed";
        milestone.completedAt = new Date();
        milestone.completedBy = userId;
        await project.save();

        return milestone;
    }

    // Xác nhận hoàn thành project
    static async completeProject(projectId, userId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }

        // Kiểm tra tất cả task trong project
        const tasks = await Task.find({ project: projectId });
        console.log(
            "DEBUG TASKS:",
            tasks.map((t) => ({ id: t._id, title: t.title, status: t.status }))
        );
        const hasIncompleteTask = tasks.some(
            (task) => task.status !== "completed"
        );

        if (hasIncompleteTask) {
            throw new Error(
                "Cannot complete project: there are incomplete tasks"
            );
        }

        // Kiểm tra tất cả milestone
        const hasIncompleteMilestone = project.milestones.some(
            (milestone) => milestone.status !== "completed"
        );

        if (hasIncompleteMilestone) {
            throw new Error(
                "Cannot complete project: there are incomplete milestones"
            );
        }

        // Cập nhật status của project
        project.status = "close";
        project.completedAt = new Date();
        project.completedBy = userId;
        await project.save();

        return project;
    }

    // Tạo milestone mới cho project
    static async createMilestone(projectId, milestoneData) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }

        // Thêm milestone mới vào project
        project.milestones.push({
            name: milestoneData.name,
            description: milestoneData.description,
            dueDate: milestoneData.dueDate,
            status: "pending",
        });

        await project.save();

        // Tạo thông báo cho tất cả thành viên project
        const memberIds = project.members.map((member) => member.user);
        await Promise.all(
            memberIds.map((userId) =>
                notificationService.createNotification({
                    user: userId,
                    type: "milestone_created",
                    message: `Milestone mới "${milestoneData.name}" đã được tạo trong dự án ${project.name}`,
                    relatedTo: project._id,
                    onModel: "Project",
                })
            )
        );

        return project;
    }

    // Cập nhật milestone
    static async updateMilestone(projectId, milestoneId, updateData) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }

        const milestone = project.milestones.id(milestoneId);
        if (!milestone) {
            throw new Error("Không tìm thấy mốc (milestone)");
        }

        // Cập nhật thông tin milestone
        Object.keys(updateData).forEach((key) => {
            if (
                key !== "status" &&
                key !== "completedAt" &&
                key !== "completedBy"
            ) {
                milestone[key] = updateData[key];
            }
        });

        await project.save();
        return milestone;
    }

    // Xóa milestone
    static async deleteMilestone(projectId, milestoneId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Không tìm thấy dự án");
        }

        const milestone = project.milestones.id(milestoneId);
        if (!milestone) {
            throw new Error("Không tìm thấy mốc (milestone)");
        }

        // Kiểm tra xem có task nào đang sử dụng milestone này không
        const tasksUsingMilestone = await Task.find({
            project: projectId,
            milestone: milestoneId,
        });

        if (tasksUsingMilestone.length > 0) {
            throw new Error(
                "Không thể xóa milestone: có task đang sử dụng milestone này"
            );
        }

        // Xóa milestone
        project.milestones.pull(milestoneId);
        await project.save();

        return { message: "Milestone deleted successfully" };
    }
}

module.exports = ProjectService;
