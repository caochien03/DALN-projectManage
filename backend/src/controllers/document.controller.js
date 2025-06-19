const documentService = require("../services/document.service");
const path = require("path");

exports.uploadDocument = async (req, res) => {
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
                message: "Bạn không có quyền upload tài liệu cho dự án này",
            });
        }
        const result = await documentService.uploadDocument(req, res);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getDocumentsByProject = async (req, res) => {
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
                message: "Bạn không có quyền xem tài liệu của dự án này",
            });
        }
        const docs = await documentService.getDocumentsByProject(req.params.id);
        res.json(docs);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        res.status(404).json({ message: error.message });
    }
};

exports.getDocumentVersions = async (req, res) => {
    try {
        const docId = req.params.docId;
        const versions = await documentService.getDocumentVersions(docId);
        res.json(versions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const docId = req.params.docId;
        await documentService.deleteDocument(docId);
        res.json({ message: "Đã xóa tài liệu" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
