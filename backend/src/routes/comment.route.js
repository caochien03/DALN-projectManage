const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const auth = require("../middleware/auth");

// Bình luận cho task
router.post("/tasks/:id/comments", auth, commentController.addCommentToTask);
router.get("/tasks/:id/comments", auth, commentController.getCommentsOfTask);

// Bình luận cho project
router.post(
    "/projects/:id/comments",
    auth,
    commentController.addCommentToProject
);
router.get(
    "/projects/:id/comments",
    auth,
    commentController.getCommentsOfProject
);

// Xóa bình luận
router.delete("/comments/:commentId", auth, commentController.deleteComment);

module.exports = router;
