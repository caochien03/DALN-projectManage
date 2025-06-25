const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload.middleware");

// Upload tài liệu
router.post(
    "/projects/:id/documents",
    auth,
    upload.single("file"),
    documentController.uploadDocument
);
// Lấy danh sách tài liệu mới nhất của project
router.get(
    "/projects/:id/documents",
    auth,
    documentController.getDocumentsByProject
);
// Download tài liệu
router.get(
    "/documents/:docId/download",
    auth,
    documentController.downloadDocument
);
// Lấy lịch sử phiên bản của tài liệu
router.get(
    "/documents/:docId/versions",
    auth,
    documentController.getDocumentVersions
);
// Xóa tài liệu (xóa mềm)
router.delete("/documents/:docId", auth, documentController.deleteDocument);

// Lấy document detail theo ID
router.get("/documents/:docId", auth, documentController.getDocumentById);

module.exports = router;
