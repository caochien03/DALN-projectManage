const documentService = require("../services/document.service");
const path = require("path");

exports.uploadDocument = async (req, res) => {
    try {
        console.log(
            "[UPLOAD DOCUMENT]",
            req.params,
            req.file && req.file.originalname
        );
        const result = await documentService.uploadDocument(req, res);
        res.status(201).json(result);
    } catch (error) {
        console.error("[UPLOAD DOCUMENT ERROR]", error);
        res.status(400).json({ message: error.message });
    }
};

exports.getDocumentsByProject = async (req, res) => {
    try {
        console.log("[GET DOCUMENTS BY PROJECT]", req.params);
        const projectId = req.params.id;
        const docs = await documentService.getDocumentsByProject(projectId);
        res.json(docs);
    } catch (error) {
        console.error("[GET DOCUMENTS BY PROJECT ERROR]", error);
        res.status(400).json({ message: error.message });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        console.log("[DOWNLOAD DOCUMENT]", req.params);
        const docId = req.params.docId;
        const { filePath, fileName } = await documentService.getDocumentFile(
            docId
        );
        res.download(filePath, fileName);
    } catch (error) {
        console.error("[DOWNLOAD DOCUMENT ERROR]", error);
        res.status(404).json({ message: error.message });
    }
};

exports.getDocumentVersions = async (req, res) => {
    try {
        console.log("[GET DOCUMENT VERSIONS]", req.params);
        const docId = req.params.docId;
        const versions = await documentService.getDocumentVersions(docId);
        res.json(versions);
    } catch (error) {
        console.error("[GET DOCUMENT VERSIONS ERROR]", error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        console.log("[DELETE DOCUMENT]", req.params);
        const docId = req.params.docId;
        await documentService.deleteDocument(docId);
        res.json({ message: "Đã xóa tài liệu" });
    } catch (error) {
        console.error("[DELETE DOCUMENT ERROR]", error);
        res.status(400).json({ message: error.message });
    }
};
