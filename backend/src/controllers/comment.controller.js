const commentService = require("../services/comment.service");

exports.addCommentToTask = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const { content, mentions } = req.body;
        const author = req.user?._id;
        const comment = await commentService.addComment({
            task: taskId,
            author,
            content,
            mentions,
        });
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getCommentsOfTask = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const comments = await commentService.getComments({ task: taskId });
        res.json(comments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.addCommentToProject = async (req, res) => {
    try {
        const project = await require("../models/Project").findById(
            req.params.id
        );
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        // Kiểm tra quyền: chỉ cho phép nếu user là thành viên của project hoặc là admin
        const isMember = project.members.some(
            (m) => m.user && m.user.equals(req.user._id)
        );
        if (!isMember && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Bạn không có quyền bình luận vào dự án này",
            });
        }
        const { content, mentions } = req.body;
        const author = req.user?._id;
        const comment = await commentService.addComment({
            project: req.params.id,
            author,
            content,
            mentions,
        });
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getCommentsOfProject = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const comments = await commentService.getComments({
            project: projectId,
        });
        res.json(comments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user?._id;
        const userRole = req.user?.role;
        const comment = await commentService.getCommentById(commentId);
        if (!comment)
            return res
                .status(404)
                .json({ message: "Không tìm thấy bình luận" });
        if (
            userRole !== "admin" &&
            String(comment.author._id) !== String(userId)
        ) {
            return res
                .status(403)
                .json({ message: "Bạn không có quyền xóa bình luận này" });
        }
        await commentService.deleteComment(commentId);
        res.json({ message: "Đã xóa bình luận" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
