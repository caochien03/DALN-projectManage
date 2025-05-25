const ProjectService = require("../services/project.service");

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
}

module.exports = ProjectController;
