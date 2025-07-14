const TaskService = require("../services/task.service");
const Comment = require("../models/Comment");
const { logActivity } = require("../services/projectActivity.service");

class TaskController {
    static async createTask(req, res) {
        try {
            const task = await TaskService.createTask({
                ...req.body,
                assignedTo: req.body.assignedTo || req.user._id,
            });
            // Ghi log activity
            await logActivity({
                project: task.project,
                user: req.user._id,
                action: "create_task",
                detail: `Tạo task "${task.title}"`,
            });
            res.status(201).json({
                success: true,
                message: "Tạo task thành công!",
                data: task,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getAllTasks(req, res) {
        try {
            const tasks = await TaskService.getAllTasks();
            res.json({ success: true, data: tasks });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getTaskById(req, res) {
        try {
            const task = await TaskService.getTaskById(req.params.id);
            if (!task) {
                return res
                    .status(404)
                    .json({ success: false, message: "Task not found" });
            }
            res.json({ success: true, data: task });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateTask(req, res) {
        try {
            const task = await TaskService.getTaskById(req.params.id);
            if (!task) {
                return res
                    .status(404)
                    .json({ success: false, message: "Task not found" });
            }
            // Kiểm tra quyền: chỉ cho phép nếu user là người được giao task hoặc là admin
            if (
                task.assignedTo &&
                task.assignedTo._id &&
                !task.assignedTo._id.equals(req.user._id) &&
                req.user.role !== "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn chỉ có thể cập nhật task của mình",
                });
            }
            const updatedTask = await TaskService.updateTask(
                req.params.id,
                req.body
            );
            // Ghi log activity
            await logActivity({
                project: updatedTask.project,
                user: req.user._id,
                action: "update_task",
                detail: `Cập nhật task "${updatedTask.title}"`,
            });
            res.json({
                success: true,
                message: "Cập nhật task thành công!",
                data: updatedTask,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async addComment(req, res) {
        try {
            const task = await TaskService.addComment(req.params.id, {
                user: req.user._id,
                content: req.body.content,
            });
            if (!task) {
                return res
                    .status(404)
                    .json({ success: false, message: "Task not found" });
            }
            res.json({
                success: true,
                message: "Thêm bình luận thành công!",
                data: task,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getOverdueTasks(req, res) {
        try {
            const tasks = await TaskService.getOverdueTasks();
            res.json({ success: true, data: tasks });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getTasksByStatus(req, res) {
        try {
            const tasks = await TaskService.getTasksByStatus(req.params.status);
            res.json({ success: true, data: tasks });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getTasksByProject(req, res) {
        try {
            const tasks = await TaskService.getTasksByProject(
                req.params.projectId
            );
            res.json({ success: true, data: tasks });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteTask(req, res) {
        try {
            await Comment.deleteMany({ task: req.params.id });
            const task = await TaskService.deleteTask(req.params.id);
            if (!task) {
                return res
                    .status(404)
                    .json({ success: false, message: "Task not found" });
            }
            // Ghi log activity
            await logActivity({
                project: task.project,
                user: req.user._id,
                action: "delete_task",
                detail: `Xóa task "${task.title}"`,
            });
            res.json({ success: true, message: "Xóa task thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = TaskController;
