const ProjectActivity = require("../models/ProjectActivity");

async function logActivity({ project, user, action, detail }) {
    return await ProjectActivity.create({
        project,
        user,
        action,
        detail,
    });
}

async function getProjectActivities(projectId) {
    return await ProjectActivity.find({ project: projectId })
        .populate("user", "name email role")
        .sort({ createdAt: -1 });
}

module.exports = {
    logActivity,
    getProjectActivities,
};
