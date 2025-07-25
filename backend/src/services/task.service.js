const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const notificationService = require("./notification.service");

class TaskService {
    static async createTask(taskData) {
        const task = new Task(taskData);
        await task.save();

        // Add task to project
        const project = await Project.findById(taskData.project);
        project.tasks.push(task._id);
        await project.save();

        // Add task to assigned user
        if (task.assignedTo) {
            const user = await User.findById(task.assignedTo);
            user.tasks.push(task._id);
            await user.save();

            // Tạo thông báo cho user được giao task
            await notificationService.createNotification({
                user: task.assignedTo,
                type: "task_assigned",
                message: `Bạn đã được giao task mới: ${task.title}`,
                relatedTo: task._id,
                onModel: "Task",
            });
        }

        // Cập nhật tiến độ dự án
        if (project) {
            await project.updateProgress();
        }

        return task;
    }

    static async getAllTasks() {
        return Task.find()
            .populate("project", "name")
            .populate("assignedTo", "name email");
    }

    static async getTaskById(id) {
        return Task.findById(id)
            .populate("project", "name")
            .populate("assignedTo", "name email");
    }

    static async updateTask(id, updates) {
        try {
            const task = await Task.findById(id);
            if (!task) {
                return null;
            }

            const oldStatus = task.status;
            const oldAssignedTo = task.assignedTo;

            // Handle date fields
            if (updates.startDate) {
                updates.startDate = new Date(updates.startDate);
            }
            if (updates.dueDate) {
                updates.dueDate = new Date(updates.dueDate);
            }

            // Update only allowed fields
            const allowedUpdates = [
                "title",
                "description",
                "status",
                "priority",
                "startDate",
                "dueDate",
                "progress",
                "assignedTo",
                "milestone",
                "project",
            ];

            Object.keys(updates).forEach((update) => {
                if (allowedUpdates.includes(update)) {
                    task[update] = updates[update];
                }
            });

            await task.save();

            // Tạo thông báo cho cập nhật trạng thái
            if (
                updates.status &&
                updates.status !== oldStatus &&
                task.assignedTo
            ) {
                await notificationService.createNotification({
                    user: task.assignedTo,
                    type: "task_status_update",
                    message: `Task "${task.title}" đã được cập nhật trạng thái thành ${updates.status}`,
                    relatedTo: task._id,
                    onModel: "Task",
                });
            }

            // Tạo thông báo cho việc giao task mới
            if (updates.assignedTo && updates.assignedTo !== oldAssignedTo) {
                await notificationService.createNotification({
                    user: updates.assignedTo,
                    type: "task_assigned",
                    message: `Bạn đã được giao task: ${task.title}`,
                    relatedTo: task._id,
                    onModel: "Task",
                });
            }

            // Cập nhật tiến độ dự án
            if (task.project) {
                const project = await Project.findById(task.project);
                if (project) {
                    await project.updateProgress();
                }
            }

            return task;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    static async addComment(taskId, commentData) {
        const task = await Task.findById(taskId);
        if (!task) {
            return null;
        }

        task.comments.push(commentData);
        await task.save();
        return task;
    }

    static async getOverdueTasks() {
        return Task.find({
            dueDate: { $lt: new Date() },
            status: { $ne: "completed" },
        })
            .populate("project", "name")
            .populate("assignedTo", "name email");
    }

    static async getTasksByStatus(status) {
        return Task.find({ status })
            .populate("project", "name")
            .populate("assignedTo", "name email");
    }

    static async getTasksByProject(projectId) {
        return Task.find({ project: projectId })
            .populate("project", "name")
            .populate("assignedTo", "name email");
    }

    static async deleteTask(id) {
        const task = await Task.findByIdAndDelete(id);
        if (!task) return null;
        // Xóa task khỏi project
        if (task.project) {
            await Project.findByIdAndUpdate(task.project, {
                $pull: { tasks: task._id },
            });
        }
        // Xóa task khỏi user
        if (task.assignedTo) {
            await User.findByIdAndUpdate(task.assignedTo, {
                $pull: { tasks: task._id },
            });
        }
        // Cập nhật tiến độ dự án
        if (task.project) {
            const project = await Project.findById(task.project);
            if (project) {
                await project.updateProgress();
            }
        }
        return task;
    }
}

module.exports = TaskService;
