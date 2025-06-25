const ProjectService = require("../services/project.service");
const User = require("../models/User");
const Project = require("../models/Project");

class ProjectController {
    static async createProject(req, res) {
        try {
            const project = await ProjectService.createProject({
                ...req.body,
                createdBy: req.user._id,
            });
            res.status(201).json(project);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAllProjects(req, res) {
        try {
            const projects = await ProjectService.getAllProjects();
            res.json(projects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getProjectById(req, res) {
        try {
            const project = await ProjectService.getProjectById(req.params.id);
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }
            // Kiểm tra quyền: chỉ cho phép nếu user là thành viên của project hoặc là admin
            const isMember = project.members.some(
                (m) => m.user && m.user._id && m.user._id.equals(req.user._id)
            );
            if (!isMember && req.user.role !== "admin") {
                return res
                    .status(403)
                    .json({ error: "Bạn không có quyền truy cập dự án này" });
            }
            res.json(project);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateProject(req, res) {
        const updates = Object.keys(req.body);
        const allowedUpdates = [
            "name",
            "description",
            "status",
            "progress",
            "startDate",
            "endDate",
            "manager",
            "departments",
            "members",
            "milestones",
        ];
        const isValidOperation = updates.every((update) =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({ error: "Invalid updates" });
        }

        try {
            const project = await ProjectService.updateProject(
                req.params.id,
                req.body
            );
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }
            res.json(project);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async addMember(req, res) {
        try {
            const project = await ProjectService.addMember(
                req.params.id,
                req.body
            );
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }
            res.json(project);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async removeMember(req, res) {
        try {
            const project = await ProjectService.removeMember(
                req.params.id,
                req.params.memberId
            );
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }
            res.json(project);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getProjectProgress(req, res) {
        try {
            const progress = await ProjectService.getProjectProgress(
                req.params.id
            );
            if (progress === null) {
                return res.status(404).json({ error: "Project not found" });
            }
            res.json({ progress });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteProject(req, res) {
        try {
            const project = await ProjectService.deleteProject(req.params.id);
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }
            res.json({ message: "Project deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async registerForProject(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const result = await ProjectService.registerForProject(id, userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async approveMember(req, res) {
        try {
            const { id, userId } = req.params;
            const managerId = req.user._id;
            const result = await ProjectService.approveMember(
                id,
                userId,
                managerId
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async rejectMember(req, res) {
        try {
            const { id, userId } = req.params;
            const managerId = req.user._id;
            const result = await ProjectService.rejectMember(
                id,
                userId,
                managerId
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async completeProject(req, res) {
        try {
            const project = await ProjectService.completeProject(
                req.params.id,
                req.user._id
            );
            res.json(project);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async completeMilestone(req, res) {
        try {
            const milestone = await ProjectService.completeMilestone(
                req.params.id,
                req.params.milestoneId,
                req.user._id
            );
            res.json(milestone);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async checkMilestoneConsistency(req, res) {
        try {
            const result = await ProjectService.checkMilestoneConsistency(
                req.params.id,
                req.params.milestoneId
            );
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Tạo milestone mới
    static async createMilestone(req, res) {
        try {
            const project = await ProjectService.createMilestone(
                req.params.id,
                req.body
            );
            res.status(201).json(project);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Cập nhật milestone
    static async updateMilestone(req, res) {
        try {
            const milestone = await ProjectService.updateMilestone(
                req.params.id,
                req.params.milestoneId,
                req.body
            );
            res.json(milestone);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Xóa milestone
    static async deleteMilestone(req, res) {
        try {
            const result = await ProjectService.deleteMilestone(
                req.params.id,
                req.params.milestoneId
            );
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = ProjectController;
