const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

class ProjectService {
    static async createProject(projectData) {
        const project = new Project(projectData);
        await project.save();
        return project;
    }

    static async getAllProjects() {
        return Project.find()
            .populate("createdBy", "name email")
            .populate("members.user", "name email position");
    }

    static async getProjectById(id) {
        return Project.findById(id)
            .populate("createdBy", "name email")
            .populate("members.user", "name email position")
            .populate("tasks");
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
            throw new Error("Project not found");
        }
        if (project.status !== "open") {
            throw new Error("Project is not open for registration");
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
            throw new Error("You have already registered for this project");
        }
        project.pendingMembers.push(userId);
        await project.save();
        return { message: "Registration successful, waiting for approval" };
    }

    // Duyệt nhân viên tham gia dự án
    static async approveMember(projectId, userId, managerId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Project not found");
        }
        if (!project.createdBy.equals(managerId)) {
            throw new Error("Only project manager can approve members");
        }
        if (!project.pendingMembers.includes(userId)) {
            throw new Error("User is not in the pending list");
        }
        project.pendingMembers = project.pendingMembers.filter(
            (id) => !id.equals(userId)
        );
        project.members.push(userId);
        await project.save();
        return { message: "Member approved successfully" };
    }

    // Từ chối nhân viên tham gia dự án
    static async rejectMember(projectId, userId, managerId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Project not found");
        }
        if (!project.createdBy.equals(managerId)) {
            throw new Error("Only project manager can reject members");
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
            throw new Error("Project not found");
        }

        const milestone = project.milestones.id(milestoneId);
        if (!milestone) {
            throw new Error("Milestone not found");
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
            throw new Error("Project not found");
        }

        const milestone = project.milestones.id(milestoneId);
        if (!milestone) {
            throw new Error("Milestone not found");
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
            throw new Error("Project not found");
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
}

module.exports = ProjectService;
