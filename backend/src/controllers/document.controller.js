const documentService = require("../services/document.service");
const path = require("path");

exports.uploadDocument = async (req, res) => {
    try {
        const result = await documentService.uploadDocument(req, res);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getDocumentsByProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const docs = await documentService.getDocumentsByProject(projectId);
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
