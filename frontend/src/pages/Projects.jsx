import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    registerForProject,
} from "../services/project";
import { getAllDepartments } from "../services/department";
import { getAllUsers } from "../services/user";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import PopConfirmFloating from "../components/PopConfirmFloating";
import ProjectSearchFilter from "../components/ProjectSearchFilter";

const statuses = ["open", "close"];

const currentUser = JSON.parse(localStorage.getItem("user"));

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "open",
        progress: 0,
        startDate: "",
        endDate: "",
        departments: [],
        members: [],
        milestones: [],
        manager: "",
    });
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [registering, setRegistering] = useState(false);

    // Main filter state (used for fetching)
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    // Pending filter state (used for input fields)
    const [pendingSearchTerm, setPendingSearchTerm] = useState("");
    const [pendingDepartment, setPendingDepartment] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
        fetchDepartments();
        fetchUsers();
    }, []);

    // Fetch projects with filters
    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const filters = {};
            if (searchTerm) filters.search = searchTerm;
            if (selectedDepartment) filters.department = selectedDepartment;
            const data = await getAllProjects(filters);
            setProjects(data);
        } catch {
            setError("Failed to fetch projects");
        } finally {
            setIsLoading(false);
        }
    };

    // Only fetch when filter state changes (not on every input)
    useEffect(() => {
        fetchProjects();
    }, [searchTerm, selectedDepartment]);

    const fetchDepartments = async () => {
        try {
            const data = await getAllDepartments();
            setDepartments(data);
        } catch {
            setError("Failed to fetch departments");
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch {
            setError("Failed to fetch users");
        }
    };

    // Handle input changes (update pending state)
    const handlePendingSearchChange = (value) => {
        setPendingSearchTerm(value);
    };
    const handlePendingDepartmentChange = (value) => {
        setPendingDepartment(value);
    };

    // Apply filter (update main state)
    const handleApplyFilter = () => {
        setSearchTerm(pendingSearchTerm);
        setSelectedDepartment(pendingDepartment);
    };

    // Clear all filters
    const clearFilters = () => {
        setPendingSearchTerm("");
        setPendingDepartment("");
        setSearchTerm("");
        setSelectedDepartment("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingProject) {
                await updateProject(editingProject._id, formData);
            } else {
                await createProject(formData);
            }
            setShowForm(false);
            setEditingProject(null);
            setFormData({
                name: "",
                description: "",
                status: "open",
                progress: 0,
                startDate: "",
                endDate: "",
                departments: [],
                members: [],
                milestones: [],
                manager: "",
            });
            fetchProjects();
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save project");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description,
            status: project.status,
            progress: project.progress,
            startDate: project.startDate ? project.startDate.slice(0, 10) : "",
            endDate: project.endDate ? project.endDate.slice(0, 10) : "",
            departments: project.departments
                ? project.departments.map((dep) => dep._id || dep)
                : [],
            members: project.members
                ? project.members.map((m) => ({
                      user: m.user?._id || m.user,
                      role: m.role,
                  }))
                : [],
            milestones: project.milestones,
            manager: project.manager?._id || project.manager || "",
        });
        setShowForm(true);
    };

    const handleDelete = async (projectId) => {
        try {
            await deleteProject(projectId);
            fetchProjects();
        } catch {
            setError("Failed to delete project");
        }
    };

    // Lọc user theo department đã chọn
    const filteredUsers = users.filter((user) =>
        formData.departments.includes(user.department?._id || user.department)
    );

    // Tự động loại bỏ member không còn thuộc department đã chọn
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            members: prev.members.filter((m) =>
                filteredUsers.some((u) => u._id === m.user)
            ),
        }));
        // eslint-disable-next-line
    }, [formData.departments]);

    // Lọc project theo department của user
    const filteredProjects =
        currentUser.role === "admin"
            ? projects
            : projects.filter((project) =>
                  project.departments?.some(
                      (dep) =>
                          (typeof dep === "object" ? dep._id : dep) ===
                          (currentUser.department?._id ||
                              currentUser.department)
                  )
              );

    // Chỉ cho phép admin/manager thêm/sửa/xóa project
    const canEdit =
        currentUser.role === "admin" || currentUser.role === "manager";

    const handleProjectClick = (project) => {
        if (currentUser.role === "admin" || currentUser.role === "manager") {
            navigate(`/projects/${project._id}`);
            return;
        }
        const isMember = project.members?.some(
            (m) => (m.user?._id || m.user) === currentUser._id
        );
        const isPending = project.pendingMembers?.includes(currentUser._id);
        if (isMember || isPending) {
            navigate(`/projects/${project._id}`);
        } else {
            setSelectedProject(project);
            setShowInfoModal(true);
        }
    };

    const handleRegister = async () => {
        if (!selectedProject) return;
        setRegistering(true);
        try {
            await registerForProject(selectedProject._id);
            toast.success("Đã gửi yêu cầu đăng ký, chờ duyệt!");
            setShowInfoModal(false);
        } catch (err) {
            toast.error(
                err.response?.data?.error || "Không thể đăng ký tham gia dự án"
            );
        } finally {
            setRegistering(false);
        }
    };

    const getProjectType = (project) => {
        const isMember = project.members?.some(
            (m) => (m.user?._id || m.user) === currentUser._id
        );
        const isPending = project.pendingMembers?.includes(currentUser._id);
        if (isMember) return "member";
        if (isPending) return "pending";
        return "not-registered";
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Projects
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all projects in your organization
                    </p>
                </div>
                {canEdit && (
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                            type="button"
                            onClick={() => {
                                setEditingProject(null);
                                setFormData({
                                    name: "",
                                    description: "",
                                    status: "open",
                                    progress: 0,
                                    startDate: "",
                                    endDate: "",
                                    departments: [],
                                    members: [],
                                    milestones: [],
                                    manager: "",
                                });
                                setShowForm(true);
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Add project
                        </button>
                    </div>
                )}
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
                title={editingProject ? "Edit Project" : "Add New Project"}
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
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Description
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

                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="open">Open</option>
                            <option value="close">Close</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="progress"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Progress (%)
                        </label>
                        <input
                            type="number"
                            name="progress"
                            id="progress"
                            min="0"
                            max="100"
                            value={formData.progress}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    progress: parseInt(e.target.value),
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="startDate"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                id="startDate"
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        startDate: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="endDate"
                                className="block text-sm font-medium text-gray-700"
                            >
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                id="endDate"
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        endDate: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="departments"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Departments
                        </label>
                        <select
                            id="departments"
                            name="departments"
                            multiple
                            value={formData.departments}
                            onChange={(e) => {
                                const selectedOptions = Array.from(
                                    e.target.selectedOptions,
                                    (option) => option.value
                                );
                                setFormData({
                                    ...formData,
                                    departments: selectedOptions,
                                });
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            {departments.map((dept) => (
                                <option key={dept._id} value={dept._id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Hold Ctrl/Cmd to select multiple departments
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="members"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Members
                        </label>
                        <select
                            id="members"
                            name="members"
                            multiple
                            value={formData.members.map((m) => m.user)}
                            onChange={(e) => {
                                const selectedOptions = Array.from(
                                    e.target.selectedOptions,
                                    (option) => ({
                                        user: option.value,
                                        role: "member",
                                    })
                                );
                                setFormData({
                                    ...formData,
                                    members: selectedOptions,
                                });
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            {filteredUsers.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.position})
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Hold Ctrl/Cmd to select multiple members
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="manager"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Manager
                        </label>
                        <select
                            id="manager"
                            name="manager"
                            value={formData.manager}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    manager: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Manager</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.position})
                                </option>
                            ))}
                        </select>
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
                                : editingProject
                                ? "Update"
                                : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Kanban Board */}
            <div className="mt-8">
                <ProjectSearchFilter
                    searchTerm={pendingSearchTerm}
                    onSearchChange={handlePendingSearchChange}
                    selectedDepartment={pendingDepartment}
                    onDepartmentChange={handlePendingDepartmentChange}
                    departments={departments}
                    onClearFilters={clearFilters}
                    onFilter={handleApplyFilter}
                />
                <div className="grid grid-cols-4 gap-4">
                    {statuses.map((status) => (
                        <div key={status} className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {status.replace("_", " ")}
                            </h3>
                            <div className="space-y-4">
                                {filteredProjects
                                    .filter((p) => p.status === status)
                                    .map((project) => (
                                        <div
                                            key={project._id}
                                            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                                handleProjectClick(project)
                                            }
                                        >
                                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                                {project.name}
                                                {currentUser.role ===
                                                    "member" && (
                                                    <>
                                                        {getProjectType(
                                                            project
                                                        ) === "member" && (
                                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                                Thành viên
                                                            </span>
                                                        )}
                                                        {getProjectType(
                                                            project
                                                        ) === "pending" && (
                                                            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                                                                Chờ duyệt
                                                            </span>
                                                        )}
                                                        {getProjectType(
                                                            project
                                                        ) ===
                                                            "not-registered" && (
                                                            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                                                Chưa đăng ký
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {project.description}
                                            </p>
                                            {/* Progress Bar */}
                                            <div className="mt-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Tiến độ
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {project.progress || 0}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${
                                                                project.progress ||
                                                                0
                                                            }%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-blue-600 mt-2">
                                                <strong>
                                                    Kết thúc dự kiến:
                                                </strong>{" "}
                                                {project.endDate?.slice(0, 10)}
                                            </p>
                                            {project.status === "close" &&
                                                project.completedAt && (
                                                    <p className="text-sm text-green-600 mt-1">
                                                        <strong>
                                                            Kết thúc thực tế:
                                                        </strong>{" "}
                                                        {new Date(
                                                            project.completedAt
                                                        ).toLocaleDateString(
                                                            "vi-VN"
                                                        )}
                                                    </p>
                                                )}
                                            {canEdit && (
                                                <div className="mt-4 flex justify-end space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(project);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <PopConfirmFloating
                                                        title="Are you sure you want to delete this project?"
                                                        onConfirm={() => {
                                                            handleDelete(
                                                                project._id
                                                            );
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </PopConfirmFloating>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title="Thông tin dự án"
            >
                {selectedProject && (
                    <div className="space-y-2">
                        <div>
                            <b>Tên dự án:</b> {selectedProject.name}
                        </div>
                        <div>
                            <b>Mô tả:</b> {selectedProject.description}
                        </div>
                        <div>
                            <b>Ngày kết thúc dự kiến:</b>{" "}
                            {selectedProject.endDate?.slice(0, 10)}
                        </div>
                        {selectedProject.status === "close" &&
                            selectedProject.completedAt && (
                                <div>
                                    <b>Ngày kết thúc thực tế:</b>{" "}
                                    {new Date(
                                        selectedProject.completedAt
                                    ).toLocaleDateString("vi-VN")}
                                </div>
                            )}
                        <div>
                            <b>Quản lý:</b>{" "}
                            {users.find(
                                (u) =>
                                    u._id ===
                                    (selectedProject.manager?._id ||
                                        selectedProject.manager)
                            )?.name || "Chưa có"}
                        </div>
                        <div>
                            <b>Milestones:</b>
                            <ul className="list-disc ml-5">
                                {selectedProject.milestones?.length > 0 ? (
                                    selectedProject.milestones.map((m, idx) => (
                                        <li key={idx}>
                                            {m.name} - {m.status} -{" "}
                                            {m.dueDate?.slice(0, 10)}
                                        </li>
                                    ))
                                ) : (
                                    <li>Chưa có milestone nào</li>
                                )}
                            </ul>
                        </div>
                        <button
                            onClick={handleRegister}
                            disabled={registering}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            {registering ? "Đang gửi..." : "Đăng ký tham gia"}
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
