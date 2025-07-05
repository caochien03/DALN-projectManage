const ProjectService = require("../services/project.service");
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Document = require("../models/Document");
const Comment = require("../models/Comment");

class ProjectController {
    static async createProject(req, res) {
        try {
            const project = await ProjectService.createProject({
                ...req.body,
                createdBy: req.user._id,
            });
            res.status(201).json({
                success: true,
                message: "Tạo dự án thành công!",
                data: project,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getAllProjects(req, res) {
        try {
            const projects = await ProjectService.getAllProjects();
            res.json({ success: true, data: projects });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getProjectById(req, res) {
        try {
            const project = await ProjectService.getProjectById(req.params.id);
            if (!project) {
                return res
                    .status(404)
                    .json({ success: false, message: "Project not found" });
            }
            // Kiểm tra quyền: chỉ cho phép nếu user là thành viên của project hoặc là admin
            const isMember = project.members.some(
                (m) => m.user && m.user._id && m.user._id.equals(req.user._id)
            );
            if (!isMember && req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền truy cập dự án này",
                });
            }
            res.json({ success: true, data: project });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
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
            return res
                .status(400)
                .json({ success: false, message: "Invalid updates" });
        }

        try {
            const project = await ProjectService.updateProject(
                req.params.id,
                req.body
            );
            if (!project) {
                return res
                    .status(404)
                    .json({ success: false, message: "Project not found" });
            }
            res.json({
                success: true,
                message: "Cập nhật dự án thành công!",
                data: project,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async addMember(req, res) {
        try {
            const project = await ProjectService.addMember(
                req.params.id,
                req.body
            );
            if (!project) {
                return res
                    .status(404)
                    .json({ success: false, message: "Project not found" });
            }
            res.json({
                success: true,
                message: "Thêm thành viên thành công!",
                data: project,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async removeMember(req, res) {
        try {
            const project = await ProjectService.removeMember(
                req.params.id,
                req.params.memberId
            );
            if (!project) {
                return res
                    .status(404)
                    .json({ success: false, message: "Project not found" });
            }
            res.json({
                success: true,
                message: "Xóa thành viên thành công!",
                data: project,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getProjectProgress(req, res) {
        try {
            const progress = await ProjectService.getProjectProgress(
                req.params.id
            );
            if (progress === null) {
                return res
                    .status(404)
                    .json({ success: false, message: "Project not found" });
            }
            res.json({ success: true, data: { progress } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteProject(req, res) {
        try {
            // Xóa tất cả task liên quan đến project này
            await Task.deleteMany({ project: req.params.id });
            // Xóa tất cả document liên quan đến project này
            await Document.deleteMany({ project: req.params.id });
            // Xóa tất cả comment liên quan đến project này
            await Comment.deleteMany({ project: req.params.id });
            const project = await ProjectService.deleteProject(req.params.id);
            if (!project) {
                return res
                    .status(404)
                    .json({ success: false, message: "Project not found" });
            }
            res.json({ success: true, message: "Xóa dự án thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async registerForProject(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const result = await ProjectService.registerForProject(id, userId);
            res.status(200).json({
                success: true,
                message: "Đăng ký tham gia dự án thành công!",
                data: result,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
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
            res.status(200).json({
                success: true,
                message: "Duyệt thành viên thành công!",
                data: result,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
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
            res.status(200).json({
                success: true,
                message: "Từ chối thành viên thành công!",
                data: result,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async completeProject(req, res) {
        try {
            const project = await ProjectService.completeProject(
                req.params.id,
                req.user._id
            );
            res.json({
                success: true,
                message: "Hoàn thành dự án thành công!",
                data: project,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async completeMilestone(req, res) {
        try {
            const milestone = await ProjectService.completeMilestone(
                req.params.id,
                req.params.milestoneId,
                req.user._id
            );
            res.json({
                success: true,
                message: "Hoàn thành milestone thành công!",
                data: milestone,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async checkMilestoneConsistency(req, res) {
        try {
            const result = await ProjectService.checkMilestoneConsistency(
                req.params.id,
                req.params.milestoneId
            );
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Tạo milestone mới
    static async createMilestone(req, res) {
        try {
            const project = await ProjectService.createMilestone(
                req.params.id,
                req.body
            );
            res.status(201).json({
                success: true,
                message: "Tạo milestone thành công!",
                data: project,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
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
            res.json({
                success: true,
                message: "Cập nhật milestone thành công!",
                data: milestone,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Xóa milestone
    static async deleteMilestone(req, res) {
        try {
            const result = await ProjectService.deleteMilestone(
                req.params.id,
                req.params.milestoneId
            );
            res.json({
                success: true,
                message: "Xóa milestone thành công!",
                data: result,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = ProjectController;
