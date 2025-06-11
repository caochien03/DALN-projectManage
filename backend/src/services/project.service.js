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
}

module.exports = ProjectService;
