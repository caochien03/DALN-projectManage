import { useState, useEffect } from "react";
import {
    uploadDocument,
    getDocumentsByProject,
    downloadDocument,
    getDocumentVersions,
    deleteDocument,
} from "../services/document";
import { toast } from "react-toastify";
import PopConfirmFloating from "./PopConfirmFloating";

export default function DocumentManager({
    projectId,
    canEdit = true,
    canDelete = true,
}) {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [versionModal, setVersionModal] = useState({
        open: false,
        doc: null,
        versions: [],
    });
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const docs = await getDocumentsByProject(projectId);
            setDocuments(docs);
        } catch {
            toast.error("Không thể tải danh sách tài liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        // eslint-disable-next-line
    }, [projectId]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        setUploading(true);
        try {
            await uploadDocument(projectId, selectedFile);
            toast.success("Tải lên thành công");
            setSelectedFile(null);
            fetchDocuments();
        } catch {
            toast.error("Tải lên thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (doc) => {
        try {
            const blob = await downloadDocument(doc._id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", doc.name);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch {
            toast.error("Không thể tải file");
        }
    };

    const handleShowVersions = async (doc) => {
        try {
            const versions = await getDocumentVersions(doc._id);
            setVersionModal({ open: true, doc, versions });
        } catch {
            toast.error("Không thể lấy lịch sử phiên bản");
        }
    };

    const handleDelete = async (doc) => {
        try {
            await deleteDocument(doc._id);
            toast.success("Đã xóa tài liệu");
            fetchDocuments();
        } catch {
            toast.error("Xóa thất bại");
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow mt-6">
            <h2 className="text-lg font-bold mb-4">Tài liệu dự án</h2>
            {canEdit && (
                <form
                    onSubmit={handleUpload}
                    className="flex items-center gap-2 mb-4"
                >
                    <input
                        type="file"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="border rounded px-2 py-1"
                    />
                    <button
                        type="submit"
                        disabled={uploading || !selectedFile}
                        className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                    >
                        {uploading ? "Đang tải..." : "Tải lên"}
                    </button>
                </form>
            )}
            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <table className="w-full text-sm border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">Tên file</th>
                            <th className="p-2 border">Người upload</th>
                            <th className="p-2 border">Ngày upload</th>
                            <th className="p-2 border">Phiên bản</th>
                            <th className="p-2 border">Dung lượng</th>
                            <th className="p-2 border">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center p-2">
                                    Chưa có tài liệu nào
                                </td>
                            </tr>
                        )}
                        {documents.map((doc) => (
                            <tr key={doc._id}>
                                <td className="p-2 border">{doc.name}</td>
                                <td className="p-2 border">
                                    {doc.uploadedBy?.name || doc.uploadedBy}
                                </td>
                                <td className="p-2 border">
                                    {new Date(doc.uploadedAt).toLocaleString()}
                                </td>
                                <td className="p-2 border text-center">
                                    {doc.version}
                                </td>
                                <td className="p-2 border">
                                    {(doc.size / 1024).toFixed(1)} KB
                                </td>
                                <td className="p-2 border flex gap-2">
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Tải về
                                    </button>
                                    <button
                                        onClick={() => handleShowVersions(doc)}
                                        className="text-green-600 hover:underline"
                                    >
                                        Phiên bản
                                    </button>
                                    {canDelete && (
                                        <PopConfirmFloating
                                            title="Bạn có chắc muốn xóa tài liệu này?"
                                            onConfirm={() => handleDelete(doc)}
                                        >
                                            <button className="text-red-600 hover:underline">
                                                Xóa
                                            </button>
                                        </PopConfirmFloating>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Modal lịch sử phiên bản */}
            {versionModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded shadow-lg p-6 min-w-[350px] relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-black"
                            onClick={() =>
                                setVersionModal({
                                    open: false,
                                    doc: null,
                                    versions: [],
                                })
                            }
                        >
                            ×
                        </button>
                        <h3 className="font-bold mb-2">
                            Lịch sử phiên bản: {versionModal.doc.name}
                        </h3>
                        <ul className="space-y-2">
                            {versionModal.versions.map((ver) => (
                                <li
                                    key={ver._id}
                                    className="flex justify-between items-center border-b pb-1"
                                >
                                    <span>
                                        v{ver.version} -{" "}
                                        {new Date(
                                            ver.uploadedAt
                                        ).toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => handleDownload(ver)}
                                        className="text-blue-600 hover:underline text-xs"
                                    >
                                        Tải về
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
