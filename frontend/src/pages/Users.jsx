import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
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
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllUsers();
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

    useEffect(() => {
        if (showForm) {
            fetchDepartments();
        }
    }, [showForm]);

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
