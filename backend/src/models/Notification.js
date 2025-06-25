const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: [
            "mention",
            "task_assigned",
            "task_due",
            "task_status_update",
            "new_comment",
            "new_document",
            "added_to_project",
            "added_to_department",
            "approval_request",
            "milestone_created",
        ],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModel",
    },
    onModel: {
        type: String,
        enum: ["Project", "Task", "Comment", "Document", "Department"],
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Notification", notificationSchema);
