const Comment = require("../models/Comment");

exports.addComment = async ({ task, project, author, content, mentions }) => {
    const comment = await Comment.create({
        task: task || undefined,
        project: project || undefined,
        author,
        content,
        mentions: mentions || [],
    });
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
    return Comment.findById(commentId).populate("author", "name email role");
};

exports.deleteComment = async (commentId) => {
    return Comment.findByIdAndDelete(commentId);
};
