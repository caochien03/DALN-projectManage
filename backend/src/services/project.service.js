const Project = require("../models/Project");
const Task = require("../models/Task");

class ProjectService {
    static async createProject(projectData) {
        const project = new Project(projectData);
        await project.save();
        return project;
    }

    static async getAllProjects() {
        return Project.find()
            .populate("createdBy", "name email")
            .populate("members.user", "name email");
    }

    static async getProjectById(id) {
        return Project.findById(id)
            .populate("createdBy", "name email")
            .populate("members.user", "name email")
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
}

module.exports = ProjectService;
