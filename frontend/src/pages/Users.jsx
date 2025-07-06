import { useState, useEffect } from "react";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
    getAllUsersWithProjectStats,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUserStats,
} from "../services/user";
import { getAllDepartments } from "../services/department";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import PopConfirmFloating from "../components/PopConfirmFloating";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        role: "all",
        department: "all",
    });
    const [userStats, setUserStats] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "member",
        department: "",
        position: "",
        phone: "",
        address: "",
    });
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
        fetchUserStats();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let data;
            if (
                searchTerm.trim() ||
                filters.role !== "all" ||
                filters.department !== "all"
            ) {
                data = await searchUsers(searchTerm.trim(), filters);
            } else {
                data = await getAllUsersWithProjectStats();
            }
            setUsers(data);
        } catch {
            setError("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await getAllDepartments();
            setDepartments(data);
        } catch {
            setError("Failed to fetch departments");
        }
    };

    const fetchUserStats = async () => {
        try {
            const data = await getUserStats();
            setUserStats(data);
        } catch {
            // Không hiển thị error vì stats không quan trọng
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingUser) {
                await updateUser(editingUser._id, formData);
            } else {
                await createUser(formData);
            }
            setShowForm(false);
            setEditingUser(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "member",
                department: "",
                position: "",
                phone: "",
                address: "",
            });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save user");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department?._id || user.department || "",
            position: user.position,
            phone: user.phone,
            address: user.address,
        });
        setShowForm(true);
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);
            fetchUsers();
        } catch {
            setError("Failed to delete user");
        }
    };

    const handleSearch = () => {
        fetchUsers();
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }));
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setFilters({
            role: "all",
            department: "all",
        });
        fetchUsers();
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Users
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all users in your organization
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => {
                            setEditingUser(null);
                            setFormData({
                                name: "",
                                email: "",
                                password: "",
                                role: "member",
                                department: "",
                                position: "",
                                phone: "",
                                address: "",
                            });
                            setShowForm(true);
                        }}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add user
                    </button>
                </div>
            </div>

            {error && (
                <div
                    className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                >
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* User Statistics */}
            {userStats && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <ChartBarIcon className="h-8 w-8 text-blue-600" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-900">
                                    Tổng số user
                                </h3>
                                <p className="text-2xl font-semibold text-blue-700">
                                    {userStats.total}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <ChartBarIcon className="h-8 w-8 text-red-600" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-900">
                                    Admin
                                </h3>
                                <p className="text-2xl font-semibold text-red-700">
                                    {userStats.byRole.admin}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-900">
                                    Manager
                                </h3>
                                <p className="text-2xl font-semibold text-yellow-700">
                                    {userStats.byRole.manager}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <ChartBarIcon className="h-8 w-8 text-green-600" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-900">
                                    Member
                                </h3>
                                <p className="text-2xl font-semibold text-green-700">
                                    {userStats.byRole.member}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, vị trí..."
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
                    <select
                        value={filters.role}
                        onChange={(e) =>
                            handleFilterChange("role", e.target.value)
                        }
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                    </select>
                    <select
                        value={filters.department}
                        onChange={(e) =>
                            handleFilterChange("department", e.target.value)
                        }
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="all">Tất cả phòng ban</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleSearch}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Lọc
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {/* Filter Status */}
            {(searchTerm.trim() ||
                filters.role !== "all" ||
                filters.department !== "all") && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Bộ lọc hiện tại:
                        </span>
                        {searchTerm.trim() && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Tìm kiếm: "{searchTerm}"
                            </span>
                        )}
                        {filters.role !== "all" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Vai trò: {filters.role}
                            </span>
                        )}
                        {filters.department !== "all" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Phòng ban:{" "}
                                {departments.find(
                                    (d) => d._id === filters.department
                                )?.name || filters.department}
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-600">
                        Tìm thấy {users.length} kết quả
                    </div>
                </div>
            )}

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editingUser ? "Edit User" : "Add New User"}
            >
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Name
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
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="member">Member</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="department"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Department
                        </label>
                        <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    department: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map((dep) => (
                                <option key={dep._id} value={dep._id}>
                                    {dep.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="position"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Position
                        </label>
                        <input
                            type="text"
                            name="position"
                            id="position"
                            value={formData.position}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    position: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Address
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {isLoading
                                ? "Saving..."
                                : editingUser
                                ? "Update"
                                : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>

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
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Role
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Department
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Position
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Projects
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Phone
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Address
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
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {user.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.role}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.department?.name ||
                                                    user.department ||
                                                    ""}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.position}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.projectStats ? (
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                Tổng:
                                                            </span>
                                                            <span className="text-xs font-semibold text-gray-900">
                                                                {
                                                                    user
                                                                        .projectStats
                                                                        .total
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs font-medium text-green-600">
                                                                Hoàn thành:
                                                            </span>
                                                            <span className="text-xs font-semibold text-green-700">
                                                                {
                                                                    user
                                                                        .projectStats
                                                                        .completed
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs font-medium text-blue-600">
                                                                Đang tham gia:
                                                            </span>
                                                            <span className="text-xs font-semibold text-blue-700">
                                                                {
                                                                    user
                                                                        .projectStats
                                                                        .active
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.phone}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.address}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(user)
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <PopConfirmFloating
                                                    title="Are you sure you want to delete this user?"
                                                    onConfirm={() =>
                                                        handleDelete(user._id)
                                                    }
                                                >
                                                    <button className="text-red-600 hover:text-red-900">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </PopConfirmFloating>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
