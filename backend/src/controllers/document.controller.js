const documentService = require("../services/document.service");
const path = require("path");
const { logActivity } = require("../services/projectActivity.service");

exports.uploadDocument = async (req, res) => {
    try {
        const project = await require("../models/Project")
            .findById(req.params.id)
            .populate("manager");
        if (!project) {
            return res
                .status(404)
                .json({ success: false, message: "Project not found" });
        }
        // Kiểm tra quyền: chỉ cho phép nếu user là thành viên của project, là admin hoặc là manager của dự án
        const isMember = project.members.some(
            (m) => m.user && m.user.equals(req.user._id)
        );
        const isManager =
            project.manager &&
            project.manager._id &&
            project.manager._id.equals(req.user._id);
        if (!isMember && req.user.role !== "admin" && !isManager) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền upload tài liệu cho dự án này",
            });
        }
        const result = await documentService.uploadDocument(req, res);
        // Ghi log activity
        await logActivity({
            project: project._id,
            user: req.user._id,
            action: "upload_document",
            detail: `Upload tài liệu "${
                result.name || result.fileName || "file"
            }"`,
        });
        res.status(201).json({
            success: true,
            message: "Upload tài liệu thành công!",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getDocumentsByProject = async (req, res) => {
    try {
        const project = await require("../models/Project")
            .findById(req.params.id)
            .populate("manager");
        if (!project) {
            return res
                .status(404)
                .json({ success: false, message: "Project not found" });
        }
        // Kiểm tra quyền: chỉ cho phép nếu user là thành viên của project, là admin hoặc là manager của dự án
        const isMember = project.members.some(
            (m) => m.user && m.user.equals(req.user._id)
        );
        const isManager =
            project.manager &&
            project.manager._id &&
            project.manager._id.equals(req.user._id);
        if (!isMember && req.user.role !== "admin" && !isManager) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xem tài liệu của dự án này",
            });
        }
        const docs = await documentService.getDocumentsByProject(req.params.id);
        res.json({ success: true, data: docs });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        const docId = req.params.docId;
        const { filePath, fileName } = await documentService.getDocumentFile(
            docId
        );
        res.download(filePath, fileName);
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

exports.getDocumentVersions = async (req, res) => {
    try {
        const docId = req.params.docId;
        const versions = await documentService.getDocumentVersions(docId);
        res.json({ success: true, data: versions });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const docId = req.params.docId;
        const doc = await documentService.getDocumentById(docId);
        if (!doc) {
            return res
                .status(404)
                .json({ success: false, message: "Document not found" });
        }
        await documentService.deleteDocument(docId);
        // Ghi log activity
        await logActivity({
            project: doc.project,
            user: req.user._id,
            action: "delete_document",
            detail: `Xóa tài liệu "${doc.name || doc.fileName || "file"}"`,
        });
        res.json({ success: true, message: "Đã xóa tài liệu" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const docId = req.params.docId;
        const document = await documentService.getDocumentById(docId);
        if (!document) {
            return res
                .status(404)
                .json({ success: false, message: "Document not found" });
        }
        res.json({ success: true, data: document });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
