import axiosInstance from "../utils/axios";

// Upload tài liệu
export const uploadDocument = async (projectId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(
        `/api/projects/${projectId}/documents`,
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );
    return res.data;
};

// Lấy danh sách tài liệu mới nhất của project
export const getDocumentsByProject = async (projectId) => {
    const response = await axiosInstance.get(
        `/api/projects/${projectId}/documents`
    );
    return response.data.data;
};

// Download tài liệu
export const downloadDocument = async (docId) => {
    const res = await axiosInstance.get(`/api/documents/${docId}/download`, {
        responseType: "blob",
    });
    return res.data;
};

// Lấy lịch sử phiên bản của tài liệu
export const getDocumentVersions = async (docId) => {
    const res = await axiosInstance.get(`/api/documents/${docId}/versions`);
    return res.data.data;
};

// Xóa tài liệu
export const deleteDocument = async (docId) => {
    const res = await axiosInstance.delete(`/api/documents/${docId}`);
    return res.data;
};

// Lấy document detail theo ID
export const getDocumentById = async (docId) => {
    const response = await axiosInstance.get(`/api/documents/${docId}`);
    return response.data.data;
};
