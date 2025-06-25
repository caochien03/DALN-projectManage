const mongoose = require("mongoose");
const Document = require("../models/Document");
const path = require("path");
const notificationService = require("./notification.service");
const Project = require("../models/Project");

exports.uploadDocument = async (req, res) => {
    // TODO: Xử lý upload file vật lý với multer
    // Giả sử đã có req.file và req.body
    // Tìm version hiện tại của file này trong project
    const { id: projectId } = req.params;
    const { originalname, filename, size, mimetype } = req.file;
    const uploadedBy = req.user._id;

    // Lấy version mới nhất
    const latest = await Document.findOne({
        project: projectId,
        name: originalname,
        isDeleted: false,
    }).sort({ version: -1 });
    const newVersion = latest ? latest.version + 1 : 1;

    const doc = await Document.create({
        project: projectId,
        name: originalname,
        path: `${projectId}/${filename}`,
        uploadedBy,
        version: newVersion,
        size,
        type: mimetype,
        originalName: originalname,
    });

    // Tạo thông báo cho tất cả thành viên project
    try {
        const project = await Project.findById(projectId).populate(
            "members.user"
        );
        if (project && project.members.length > 0) {
            const memberIds = project.members.map((member) => member.user._id);

            // Tạo notification cho tất cả thành viên (trừ người upload)
            const notifications = memberIds
                .filter((memberId) => !memberId.equals(uploadedBy))
                .map((memberId) => ({
                    user: memberId,
                    type: "new_document",
                    message: `Tài liệu mới "${originalname}" đã được thêm vào dự án ${project.name}`,
                    relatedTo: doc._id,
                    onModel: "Document",
                }));

            await Promise.all(
                notifications.map((notification) =>
                    notificationService.createNotification(notification)
                )
            );
        }
    } catch (error) {
        console.error("Error creating document notification:", error);
    }

    return doc;
};

exports.getDocumentsByProject = async (projectId) => {
    // Lấy tài liệu mới nhất của mỗi tên file trong project
    const docs = await Document.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
                isDeleted: false,
            },
        },
        { $sort: { name: 1, version: -1 } },
        {
            $group: {
                _id: "$name",
                doc: { $first: "$$ROOT" },
            },
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { uploadedAt: -1 } },
    ]);
    // Populate uploadedBy
    return Document.populate(docs, {
        path: "uploadedBy",
        select: "name email",
    });
};

exports.getDocumentFile = async (docId) => {
    const doc = await Document.findById(docId);
    if (!doc || doc.isDeleted) throw new Error("Không tìm thấy tài liệu");
    // Đường dẫn file vật lý
    const filePath = path.join(__dirname, "../../uploads", doc.path);
    return { filePath, fileName: doc.name };
};

exports.getDocumentVersions = async (docId) => {
    const doc = await Document.findById(docId);
    if (!doc) throw new Error("Không tìm thấy tài liệu");
    // Lấy tất cả version của file này trong project
    const versions = await Document.find({
        project: doc.project,
        name: doc.name,
        isDeleted: false,
    }).sort({ version: -1 });
    return versions;
};

exports.deleteDocument = async (docId) => {
    // Xóa mềm
    await Document.findByIdAndUpdate(docId, { isDeleted: true });
};

exports.getDocumentById = async (docId) => {
    return Document.findById(docId)
        .populate("project", "name")
        .populate("uploadedBy", "name email");
};
