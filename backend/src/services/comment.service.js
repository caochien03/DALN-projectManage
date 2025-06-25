const Comment = require("../models/Comment");
const notificationService = require("./notification.service");

exports.addComment = async ({ task, project, author, content, mentions }) => {
    const comment = await Comment.create({
        task: task || undefined,
        project: project || undefined,
        author,
        content,
        mentions: mentions || [],
    });

    // Tạo thông báo cho mentions
    if (mentions && mentions.length > 0) {
        for (const mentionId of mentions) {
            await notificationService.createNotification({
                user: mentionId,
                type: "mention",
                message: `Bạn được nhắc đến trong một comment: "${content.substring(
                    0,
                    50
                )}..."`,
                relatedTo: comment._id,
                onModel: "Comment",
            });
        }
    }

    // Tạo thông báo cho task owner nếu comment trong task
    if (task) {
        const Task = require("../models/Task");
        const taskDoc = await Task.findById(task).populate("assignedTo");
        if (
            taskDoc &&
            taskDoc.assignedTo &&
            taskDoc.assignedTo._id.toString() !== author.toString()
        ) {
            await notificationService.createNotification({
                user: taskDoc.assignedTo._id,
                type: "new_comment",
                message: `Có comment mới trong task "${
                    taskDoc.title
                }": "${content.substring(0, 50)}..."`,
                relatedTo: comment._id,
                onModel: "Comment",
            });
        }
    }

    return Comment.findById(comment._id)
        .populate("author", "name email")
        .populate("mentions", "name email");
};

exports.getComments = async (filter) => {
    return Comment.find(filter)
        .sort({ createdAt: 1 })
        .populate("author", "name email")
        .populate("mentions", "name email");
};

exports.getCommentById = async (commentId) => {
    return Comment.findById(commentId)
        .populate("author", "name email role")
        .populate("project", "name")
        .populate("task", "title project");
};

exports.deleteComment = async (commentId) => {
    return Comment.findByIdAndDelete(commentId);
};
