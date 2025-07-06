import { useState, useEffect } from "react";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChartBarIcon,
    EyeIcon,
    FunnelIcon,
} from "@heroicons/react/24/outline";
import {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    searchDepartments,
    getDepartmentStats,
    getDepartmentMembers,
} from "../services/department";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import PopConfirmFloating from "../components/PopConfirmFloating";

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [departmentStats, setDepartmentStats] = useState(null);
    const [departmentMembers, setDepartmentMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteOptions, setDeleteOptions] = useState({
        force: false,
        userAction: "null",
    });
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            let data;
            if (searchTerm.trim()) {
                data = await searchDepartments(searchTerm.trim());
            } else {
                data = await getAllDepartments();
            }
            setDepartments(data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Không thể tải danh sách phòng ban"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        fetchDepartments();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            if (editingDepartment) {
                await updateDepartment(editingDepartment._id, formData);
                setSuccess("Cập nhật phòng ban thành công!");
            } else {
                await createDepartment(formData);
                setSuccess("Tạo phòng ban thành công!");
            }

            // Đóng form và reset state
            setShowForm(false);
            setEditingDepartment(null);
            setFormData({
                name: "",
                description: "",
            });

            // Cập nhật lại danh sách phòng ban
            await fetchDepartments();
        } catch (error) {
            setError(
                error.response?.data?.message || "Không thể lưu phòng ban"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (department) => {
        setEditingDepartment(department);
        setFormData({
            name: department.name,
            description: department.description || "",
        });
        setShowForm(true);
    };

    const handleDeleteClick = (department) => {
        setSelectedDepartment(department);
        setDeleteOptions({ force: false, userAction: "null" });
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const result = await deleteDepartment(
                selectedDepartment._id,
                deleteOptions.force,
                deleteOptions.userAction
            );
            setSuccess(result.message || "Xóa phòng ban thành công!");
            setShowDeleteConfirm(false);
            fetchDepartments();
        } catch (error) {
            setError(
                error.response?.data?.message || "Không thể xóa phòng ban"
            );
        }
    };

    const handleViewStats = async (department) => {
        try {
            const stats = await getDepartmentStats(department._id);
            setDepartmentStats(stats);
            setSelectedDepartment(department);
            setShowStats(true);
        } catch (error) {
            setError(error.response?.data?.message || "Không thể tải thống kê");
        }
    };

    const handleViewMembers = async (department) => {
        try {
            const members = await getDepartmentMembers(department._id);
            setDepartmentMembers(members);
            setSelectedDepartment(department);
            setShowMembers(true);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Không thể tải danh sách thành viên"
            );
        }
    };

    if (isLoading && departments.length === 0) {
        return <Loading />;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Quản lý Phòng ban
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Danh sách tất cả phòng ban trong tổ chức
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => {
                            setEditingDepartment(null);
                            setFormData({
                                name: "",
                                description: "",
                            });
                            setShowForm(true);
                        }}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Thêm phòng ban
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm phòng ban..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSearch}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Lọc
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{success}</span>
                    <button
                        onClick={() => setSuccess("")}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <span className="sr-only">Dismiss</span>
                        <svg
                            className="fill-current h-6 w-6"
                            role="button"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <title>Close</title>
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                        </svg>
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setError("")}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <span className="sr-only">Dismiss</span>
                        <svg
                            className="fill-current h-6 w-6"
                            role="button"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <title>Close</title>
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Department Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={
                    editingDepartment
                        ? "Chỉnh sửa Phòng ban"
                        : "Thêm Phòng ban Mới"
                }
            >
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Tên phòng ban *
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Mô tả
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {isLoading
                                ? "Đang lưu..."
                                : editingDepartment
                                ? "Cập nhật"
                                : "Tạo"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Xác nhận xóa phòng ban"
            >
                <div className="mt-5 space-y-4">
                    <p className="text-gray-700">
                        Bạn có chắc muốn xóa phòng ban{" "}
                        <strong>{selectedDepartment?.name}</strong>?
                    </p>

                    {selectedDepartment?.memberCount > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-yellow-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Phòng ban có{" "}
                                        {selectedDepartment?.memberCount} thành
                                        viên
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>Chọn cách xử lý thành viên:</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedDepartment?.memberCount > 0 && (
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={deleteOptions.force}
                                    onChange={(e) =>
                                        setDeleteOptions({
                                            ...deleteOptions,
                                            force: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Xóa cưỡng bức (force delete)
                                </span>
                            </label>

                            {deleteOptions.force && (
                                <div className="ml-6 space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="userAction"
                                            value="null"
                                            checked={
                                                deleteOptions.userAction ===
                                                "null"
                                            }
                                            onChange={(e) =>
                                                setDeleteOptions({
                                                    ...deleteOptions,
                                                    userAction: e.target.value,
                                                })
                                            }
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Để thành viên không thuộc phòng ban
                                            nào
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="userAction"
                                            value="deactivate"
                                            checked={
                                                deleteOptions.userAction ===
                                                "deactivate"
                                            }
                                            onChange={(e) =>
                                                setDeleteOptions({
                                                    ...deleteOptions,
                                                    userAction: e.target.value,
                                                })
                                            }
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Vô hiệu hóa tất cả thành viên
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="userAction"
                                            value="move"
                                            checked={
                                                deleteOptions.userAction ===
                                                "move"
                                            }
                                            onChange={(e) =>
                                                setDeleteOptions({
                                                    ...deleteOptions,
                                                    userAction: e.target.value,
                                                })
                                            }
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Chuyển thành viên sang phòng ban
                                            khác
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Department Stats Modal */}
            <Modal
                isOpen={showStats}
                onClose={() => setShowStats(false)}
                title={`Thống kê - ${selectedDepartment?.name}`}
            >
                {departmentStats && (
                    <div className="mt-5 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-base font-medium text-blue-900">
                                    Thành viên
                                </h3>
                                <p className="text-xl font-semibold text-indigo-600">
                                    {departmentStats.members.total}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-base font-medium text-green-900">
                                    Dự án đang mở
                                </h3>
                                <p className="text-xl font-semibold text-green-700">
                                    {departmentStats.projects.open}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-base font-medium text-gray-900">
                                    Dự án đã đóng
                                </h3>
                                <p className="text-xl font-semibold text-gray-700">
                                    {departmentStats.projects.close}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="text-base font-medium text-purple-900">
                                    Ngày tạo
                                </h3>
                                <p className="text-xl font-semibold text-purple-700">
                                    {new Date(
                                        departmentStats.department.createdAt
                                    ).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Department Members Modal */}
            <Modal
                isOpen={showMembers}
                onClose={() => setShowMembers(false)}
                title={`Thành viên - ${selectedDepartment?.name}`}
            >
                <div className="mt-5">
                    {departmentMembers.length > 0 ? (
                        <div className="space-y-3">
                            {departmentMembers.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {member.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {member.position} • {member.role}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            Không có thành viên nào
                        </p>
                    )}
                </div>
            </Modal>

            {/* Departments Table */}
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                        >
                                            Tên phòng ban
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Mô tả
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Thành viên
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Ngày tạo
                                        </th>
                                        <th
                                            scope="col"
                                            className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                        >
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {departments.map((department) => (
                                        <tr key={department._id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {department.name}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {department.description ||
                                                    "Không có mô tả"}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <button
                                                    onClick={() =>
                                                        handleViewMembers(
                                                            department
                                                        )
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {department.memberCount ||
                                                        0}{" "}
                                                    thành viên
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(
                                                    department.createdAt
                                                ).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleViewStats(
                                                                department
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Xem thống kê"
                                                    >
                                                        <ChartBarIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                department
                                                            )
                                                        }
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                department
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Xóa phòng ban"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {departments.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Không có phòng ban nào</p>
                </div>
            )}
        </div>
    );
}
