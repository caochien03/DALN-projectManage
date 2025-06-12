const TaskService = require("../services/task.service");

class TaskController {
    static async createTask(req, res) {
        try {
            const task = await TaskService.createTask({
                ...req.body,
                assignedTo: req.body.assignedTo || req.user._id,
            });
            res.status(201).json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAllTasks(req, res) {
        try {
            const tasks = await TaskService.getAllTasks();
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTaskById(req, res) {
        try {
            const task = await TaskService.getTaskById(req.params.id);
            if (!task) {
                return res.status(404).json({ error: "Task not found" });
            }
            res.json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateTask(req, res) {
        const updates = Object.keys(req.body);
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
        const isValidOperation = updates.every((update) =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({ error: "Invalid updates" });
        }

        try {
            const task = await TaskService.updateTask(req.params.id, req.body);
            if (!task) {
                return res.status(404).json({ error: "Task not found" });
            }
            res.json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async addComment(req, res) {
        try {
            const task = await TaskService.addComment(req.params.id, {
                user: req.user._id,
                content: req.body.content,
            });
            if (!task) {
                return res.status(404).json({ error: "Task not found" });
            }
            res.json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getOverdueTasks(req, res) {
        try {
            const tasks = await TaskService.getOverdueTasks();
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTasksByStatus(req, res) {
        try {
            const tasks = await TaskService.getTasksByStatus(req.params.status);
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTasksByProject(req, res) {
        try {
            const tasks = await TaskService.getTasksByProject(
                req.params.projectId
            );
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteTask(req, res) {
        try {
            const task = await TaskService.deleteTask(req.params.id);
            if (!task) {
                return res.status(404).json({ error: "Task not found" });
            }
            res.json({ message: "Task deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TaskController;
