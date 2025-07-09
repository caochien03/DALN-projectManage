import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllUsers } from "../services/user";
import { getAllDepartments } from "../services/department";
import { createTask, updateTask, deleteTask } from "../services/task";
import {
    getProjectById,
    completeProject,
    completeMilestone,
    checkMilestoneConsistency,
    approveMember,
    rejectMember,
    createMilestone,
    updateMilestone,
    deleteMilestone,
} from "../services/project";
import Modal from "../components/Modal";
import TaskBoard from "../components/TaskBoard";
import DocumentManager from "../components/DocumentManager";
import CommentBox from "../components/CommentBox";
import Loading from "../components/Loading";
import PermissionNotice from "../components/PermissionNotice";
import PopConfirmFloating from "../components/PopConfirmFloating";
import {
    UserIcon,
    CalendarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        assignedTo: "",
        status: "todo",
        priority: "medium",
        startDate: "",
        dueDate: "",
        milestone: "",
    });
    const [taskLoading, setTaskLoading] = useState(false);
    const [taskError, setTaskError] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [milestoneLoading, setMilestoneLoading] = useState(false);
    const [milestoneError, setMilestoneError] = useState("");
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [milestoneForm, setMilestoneForm] = useState({
        name: "",
        description: "",
        dueDate: "",
    });
    const [editingMilestone, setEditingMilestone] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projectData, usersRes, departmentsRes] = await Promise.all([
                getProjectById(id),
                getAllUsers(),
                getAllDepartments(),
            ]);
            setProject(projectData);
            setTasks(projectData.tasks || []);
            setUsers(usersRes);
            setDepartments(departmentsRes);
        } catch {
            setError("Không thể tải dữ liệu project");
        } finally {
            setLoading(false);
        }
    };

    const getUserName = (user) => {
        if (!user) return "";
        if (typeof user === "object" && user.name) return user.name;
        const found = users.find((u) => u._id === user || u.id === user);
        return found ? found.name : user;
    };

    const getDepartmentName = (depId) => {
        const dep = departments.find((d) => d._id === depId || d.id === depId);
        return dep ? dep.name : depId;
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setTaskLoading(true);
        setTaskError("");
        try {
            await createTask({
                ...taskForm,
                project: id,
            });
            setShowTaskModal(false);
            setTaskForm({
                title: "",
                description: "",
                assignedTo: "",
                status: "todo",
                priority: "medium",
                startDate: "",
                dueDate: "",
                milestone: "",
            });
            fetchData();
        } catch (err) {
            setTaskError(err.response?.data?.message || "Không thể tạo task");
        } finally {
            setTaskLoading(false);
        }
    };

    const openEditTask = (task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            status: task.status,
            priority: task.priority,
            startDate: task.startDate?.slice(0, 10) || "",
            dueDate: task.dueDate?.slice(0, 10) || "",
            milestone: task.milestone || "",
        });
        setShowTaskModal(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        setTaskLoading(true);
        setTaskError("");
        try {
            await updateTask(editingTask._id, {
                ...taskForm,
                project: id,
            });
            setShowTaskModal(false);
            setEditingTask(null);
            setTaskForm({
                title: "",
                description: "",
                assignedTo: "",
                status: "todo",
                priority: "medium",
                startDate: "",
                dueDate: "",
                milestone: "",
            });
            fetchData();
        } catch (err) {
            setTaskError(
                err.response?.data?.message || "Không thể cập nhật task"
            );
        } finally {
            setTaskLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        setTaskLoading(true);
        try {
            await deleteTask(taskId);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Không thể xóa task");
        } finally {
            setTaskLoading(false);
        }
    };

    const handleTaskUpdate = async (taskId, taskData) => {
        await updateTask(taskId, taskData);
    };

    // Optimistic update for task status
    const handleTaskStatusChangeOptimistic = (taskId, newStatus) => {
        setTasks((prevTasks) =>
            prevTasks.map((t) =>
                t._id === taskId ? { ...t, status: newStatus } : t
            )
        );
    };

    // Lấy danh sách user là member của project
    const projectMembers =
        project?.members
            ?.map((m) => {
                if (typeof m.user === "object" && m.user?._id) return m.user;
                return users.find((u) => u._id === m.user || u.id === m.user);
            })
            .filter((u) => u && u._id) || [];

    // Lấy user hiện tại từ localStorage
    const currentUser = JSON.parse(localStorage.getItem("user"));

    // Kiểm tra quyền
    const isAdmin = currentUser?.role === "admin";
    const isManager = currentUser?.role === "manager";
    const isProjectManager = isAdmin || isManager;
    const isMember = currentUser?.role === "member";

    // Kiểm tra xem user có phải là member của project không
    const isProjectMember = project?.members?.some(
        (m) => (m.user?._id || m.user) === currentUser?._id
    );

    // Kiểm tra xem user có thể chỉnh sửa task không (admin/manager hoặc member được giao task)
    const canEditTask = (task) => {
        if (isProjectManager) return true;
        if (isMember && task.assignedTo === currentUser?._id) return true;
        return false;
    };

    // Kiểm tra xem user có thể xóa task không (chỉ admin/manager)
    const canDeleteTask = () => {
        return isProjectManager;
    };

    // Kiểm tra xem user có thể tạo task không (admin/manager)
    const canCreateTask = isProjectManager;

    // Kiểm tra xem user có thể upload document không (admin/manager hoặc member của project)
    const canUploadDocument = isProjectManager || isProjectMember;

    // Kiểm tra xem user có thể xóa document không (chỉ admin/manager)
    const canDeleteDocument = isProjectManager;

    // Xác nhận hoàn thành project
    const handleCompleteProject = async () => {
        try {
            await completeProject(id);
            await fetchData(); // Lấy lại toàn bộ dữ liệu project mới nhất
            toast.success("Đã xác nhận hoàn thành dự án");
        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                    "Không thể xác nhận hoàn thành dự án"
            );
        }
    };

    // Xác nhận hoàn thành milestone
    const handleCompleteMilestone = async (milestoneId) => {
        setMilestoneLoading(true);
        setMilestoneError("");
        try {
            await completeMilestone(id, milestoneId);
            await fetchData(); // Lấy lại toàn bộ dữ liệu project mới nhất
            toast.success("Đã xác nhận hoàn thành milestone");
        } catch (err) {
            setMilestoneError(
                err.response?.data?.error ||
                    "Không thể xác nhận hoàn thành milestone"
            );
        } finally {
            setMilestoneLoading(false);
        }
    };

    // Kiểm tra tính nhất quán của milestone
    const handleCheckMilestoneConsistency = async (milestoneId) => {
        try {
            const result = await checkMilestoneConsistency(id, milestoneId);
            if (result.updated) {
                toast.success(result.message);
                fetchData();
            }
        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                    "Không thể kiểm tra tính nhất quán của milestone"
            );
        }
    };

    const handleApprove = async (userId) => {
        const user = users.find((u) => u._id === userId);
        console.log("APPROVE userId:", userId, "user:", user);
        try {
            await approveMember(id, userId);
            toast.success("Đã duyệt thành viên!");
            fetchData();
        } catch (err) {
            toast.error(
                err.response?.data?.error || "Không thể duyệt thành viên"
            );
        }
    };

    const handleReject = async (userId) => {
        try {
            await rejectMember(id, userId);
            toast.success("Đã từ chối thành viên!");
            fetchData();
        } catch (err) {
            toast.error(
                err.response?.data?.error || "Không thể từ chối thành viên"
            );
        }
    };

    // Tạo milestone mới
    const handleCreateMilestone = async (e) => {
        e.preventDefault();
        setMilestoneLoading(true);
        setMilestoneError("");
        try {
            await createMilestone(id, milestoneForm);
            setShowMilestoneModal(false);
            setMilestoneForm({
                name: "",
                description: "",
                dueDate: "",
            });
            fetchData();
            toast.success("Đã tạo milestone thành công!");
        } catch (err) {
            setMilestoneError(
                err.response?.data?.error || "Không thể tạo milestone"
            );
        } finally {
            setMilestoneLoading(false);
        }
    };

    // Mở modal chỉnh sửa milestone
    const openEditMilestone = (milestone) => {
        setEditingMilestone(milestone);
        setMilestoneForm({
            name: milestone.name,
            description: milestone.description,
            dueDate: milestone.dueDate?.slice(0, 10) || "",
        });
        setShowMilestoneModal(true);
    };

    // Cập nhật milestone
    const handleUpdateMilestone = async (e) => {
        e.preventDefault();
        setMilestoneLoading(true);
        setMilestoneError("");
        try {
            await updateMilestone(id, editingMilestone._id, milestoneForm);
            setShowMilestoneModal(false);
            setEditingMilestone(null);
            setMilestoneForm({
                name: "",
                description: "",
                dueDate: "",
            });
            fetchData();
            toast.success("Đã cập nhật milestone thành công!");
        } catch (err) {
            setMilestoneError(
                err.response?.data?.error || "Không thể cập nhật milestone"
            );
        } finally {
            setMilestoneLoading(false);
        }
    };

    // Xóa milestone
    const handleDeleteMilestone = async (milestoneId) => {
        setMilestoneLoading(true);
        try {
            await deleteMilestone(id, milestoneId);
            fetchData();
            toast.success("Đã xóa milestone thành công!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Không thể xóa milestone");
        } finally {
            setMilestoneLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }
    if (error) return <div className="text-red-500 p-8">{error}</div>;
    if (!project) return null;

    // Helper: status badge
    const statusBadge = (status) => {
        if (status === "open")
            return (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold ml-2">
                    Đang mở
                </span>
            );
        if (status === "close")
            return (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold ml-2">
                    Đã đóng
                </span>
            );
        return (
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold ml-2">
                Khác
            </span>
        );
    };

    // Helper: manager info
    const manager = users.find(
        (u) => u._id === (project.manager?._id || project.manager)
    );

    // Helper: progress bar
    const progress = project.progress || 0;

    // Helper: member avatars
    const memberAvatars = projectMembers.map((m, idx) => (
        <div key={m._id || idx} className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                {m.avatar ? (
                    <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    m.name?.[0]
                )}
            </div>
            <span className="text-gray-800 text-sm">{m.name}</span>
            <span className="text-xs text-gray-500">{m.position}</span>
        </div>
    ));

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {project.name}
                        </h1>
                        {statusBadge(project.status)}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap mb-2">
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                                Bắt đầu: {project.startDate?.slice(0, 10)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                                Kết thúc: {project.endDate?.slice(0, 10)}
                            </span>
                        </div>
                        {manager && (
                            <div className="flex items-center gap-1 text-gray-600 text-sm">
                                <UserIcon className="h-4 w-4" />
                                <span>Quản lý: {manager.name}</span>
                            </div>
                        )}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                                Tiến độ
                            </span>
                            <span className="text-sm text-gray-500">
                                {progress}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                {/* Action buttons */}
                <div className="flex flex-col gap-2 md:items-end">
                    {canCreateTask && (
                        <button
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                            onClick={() => setShowTaskModal(true)}
                        >
                            + Thêm task
                        </button>
                    )}
                    {(currentUser.role === "admin" ||
                        currentUser.role === "manager") && (
                        <button
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200"
                            onClick={() => setShowMilestoneModal(true)}
                        >
                            + Thêm milestone
                        </button>
                    )}
                    {isProjectManager && project.status === "open" && (
                        <PopConfirmFloating
                            title="Xác nhận hoàn thành dự án?"
                            onConfirm={handleCompleteProject}
                        >
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 mt-2">
                                <CheckCircleIcon className="h-5 w-5 inline mr-1" />
                                Hoàn thành dự án
                            </button>
                        </PopConfirmFloating>
                    )}
                </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Info, milestones, tasks, documents */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Thông tin dự án */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Thông tin dự án
                        </h2>
                        <p className="text-gray-700 mb-2">
                            {project.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>
                                Phòng ban:{" "}
                                {project.departments
                                    ?.map(getDepartmentName)
                                    .join(", ")}
                            </span>
                            <span>
                                Trạng thái: {statusBadge(project.status)}
                            </span>
                        </div>
                    </div>
                    {/* Milestones */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />{" "}
                            Milestones
                        </h2>
                        <ul className="space-y-3">
                            {project.milestones?.length > 0 ? (
                                project.milestones
                                    .filter((m) => m && m._id)
                                    .map((m, idx) => (
                                        <li
                                            key={m._id || idx}
                                            className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-100"
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                    {m.name}
                                                    {m.status === "pending" && (
                                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">
                                                            Chờ hoàn thành
                                                        </span>
                                                    )}
                                                    {m.status ===
                                                        "completed" && (
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                                                            Đã hoàn thành
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Hạn:{" "}
                                                    {m.dueDate?.slice(0, 10)}
                                                </div>
                                                {m.completedAt && (
                                                    <div className="text-xs text-gray-400">
                                                        Hoàn thành:{" "}
                                                        {new Date(
                                                            m.completedAt
                                                        ).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-2 md:mt-0">
                                                {m.status === "pending" && (
                                                    <PopConfirmFloating
                                                        title="Xác nhận hoàn thành milestone này?"
                                                        onConfirm={() =>
                                                            handleCompleteMilestone(
                                                                m._id
                                                            )
                                                        }
                                                        okText="Xác nhận"
                                                    >
                                                        <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                                                            Hoàn thành
                                                        </button>
                                                    </PopConfirmFloating>
                                                )}
                                                {m.status === "completed" && (
                                                    <button
                                                        onClick={() =>
                                                            handleCheckMilestoneConsistency(
                                                                m._id
                                                            )
                                                        }
                                                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                    >
                                                        Kiểm tra
                                                    </button>
                                                )}
                                                {(currentUser.role ===
                                                    "admin" ||
                                                    currentUser.role ===
                                                        "manager") && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                openEditMilestone(
                                                                    m
                                                                )
                                                            }
                                                            className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                                                        >
                                                            Sửa
                                                        </button>
                                                        <PopConfirmFloating
                                                            title="Bạn có chắc chắn muốn xóa milestone này?"
                                                            onConfirm={() =>
                                                                handleDeleteMilestone(
                                                                    m._id
                                                                )
                                                            }
                                                        >
                                                            <button className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                                                                Xóa
                                                            </button>
                                                        </PopConfirmFloating>
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    ))
                            ) : (
                                <li className="text-gray-500">
                                    Chưa có milestone nào
                                </li>
                            )}
                        </ul>
                        {milestoneError && (
                            <div className="text-red-500 text-sm mt-2">
                                {milestoneError}
                            </div>
                        )}
                    </div>
                    {/* Tasks */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Tasks
                        </h2>
                        <TaskBoard
                            tasks={tasks}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskEdit={openEditTask}
                            onTaskDelete={handleDeleteTask}
                            getUserName={getUserName}
                            onTaskStatusChangeOptimistic={
                                handleTaskStatusChangeOptimistic
                            }
                            canEditTask={canEditTask}
                            canDeleteTask={canDeleteTask}
                        />
                    </div>
                    {/* Documents - moved here */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ExclamationCircleIcon className="h-5 w-5 text-blue-500" />{" "}
                            Tài liệu
                        </h2>
                        <DocumentManager
                            projectId={id}
                            canEdit={canUploadDocument}
                            canDelete={canDeleteDocument}
                        />
                    </div>
                </div>
                {/* Right: Members, Comments */}
                <div className="flex flex-col gap-8">
                    {/* Members */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-indigo-500" />{" "}
                            Thành viên
                        </h2>
                        <div>{memberAvatars}</div>
                        {(currentUser.role === "admin" ||
                            currentUser.role === "manager") &&
                            project.pendingMembers?.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-sm mb-2">
                                        Thành viên chờ duyệt:
                                    </h3>
                                    <ul>
                                        {project.pendingMembers
                                            ?.filter((userId) => userId)
                                            .map((userId) => {
                                                const user = users.find(
                                                    (u) => u._id === userId
                                                );
                                                return (
                                                    <li
                                                        key={userId}
                                                        className="flex items-center gap-2 mb-1"
                                                    >
                                                        {user?.name || userId}
                                                        <PopConfirmFloating
                                                            title="Duyệt thành viên này?"
                                                            onConfirm={() =>
                                                                handleApprove(
                                                                    userId
                                                                )
                                                            }
                                                            okText="Duyệt"
                                                        >
                                                            <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                                                                Duyệt
                                                            </button>
                                                        </PopConfirmFloating>
                                                        <PopConfirmFloating
                                                            title="Từ chối thành viên này?"
                                                            onConfirm={() =>
                                                                handleReject(
                                                                    userId
                                                                )
                                                            }
                                                            okText="Từ chối"
                                                        >
                                                            <button className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                                                Từ chối
                                                            </button>
                                                        </PopConfirmFloating>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                </div>
                            )}
                    </div>
                    {/* Comments */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />{" "}
                            Bình luận
                        </h2>
                        <CommentBox
                            type="project"
                            id={id}
                            members={projectMembers}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
            </div>

            {/* Modals giữ nguyên như cũ */}
            <Modal
                isOpen={showTaskModal}
                onClose={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setTaskForm({
                        title: "",
                        description: "",
                        assignedTo: "",
                        status: "todo",
                        priority: "medium",
                        startDate: "",
                        dueDate: "",
                        milestone: "",
                    });
                }}
                title={editingTask ? "Sửa task" : "Tạo task mới"}
            >
                <form
                    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Tiêu đề
                        </label>
                        <input
                            type="text"
                            value={taskForm.title}
                            onChange={(e) =>
                                setTaskForm({
                                    ...taskForm,
                                    title: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Mô tả
                        </label>
                        <textarea
                            value={taskForm.description}
                            onChange={(e) =>
                                setTaskForm({
                                    ...taskForm,
                                    description: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Người thực hiện
                        </label>
                        <select
                            value={taskForm.assignedTo}
                            onChange={(e) =>
                                setTaskForm({
                                    ...taskForm,
                                    assignedTo: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Chọn người thực hiện</option>
                            {projectMembers.map((user) =>
                                user && user._id ? (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ) : null
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Độ ưu tiên
                        </label>
                        <select
                            value={taskForm.priority}
                            onChange={(e) =>
                                setTaskForm({
                                    ...taskForm,
                                    priority: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="low">Thấp</option>
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Ngày bắt đầu
                        </label>
                        <input
                            type="date"
                            value={taskForm.startDate}
                            onChange={(e) =>
                                setTaskForm({
                                    ...taskForm,
                                    startDate: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Ngày kết thúc
                        </label>
                        <input
                            type="date"
                            value={taskForm.dueDate}
                            onChange={(e) =>
                                setTaskForm({
                                    ...taskForm,
                                    dueDate: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Milestone
                        </label>
                        <select
                            value={taskForm.milestone}
                            onChange={(e) =>
                                setTaskForm({
                                    ...taskForm,
                                    milestone: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Chọn milestone</option>
                            {project.milestones?.map((milestone) =>
                                milestone && milestone._id ? (
                                    <option
                                        key={milestone._id}
                                        value={milestone._id}
                                    >
                                        {milestone.name}
                                    </option>
                                ) : null
                            )}
                        </select>
                    </div>
                    {taskError && (
                        <div className="text-red-500 text-sm">{taskError}</div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowTaskModal(false);
                                setEditingTask(null);
                                setTaskForm({
                                    title: "",
                                    description: "",
                                    assignedTo: "",
                                    status: "todo",
                                    priority: "medium",
                                    startDate: "",
                                    dueDate: "",
                                    milestone: "",
                                });
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={taskLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {taskLoading
                                ? "Đang xử lý..."
                                : editingTask
                                ? "Cập nhật"
                                : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal cho milestone */}
            <Modal
                isOpen={showMilestoneModal}
                onClose={() => {
                    setShowMilestoneModal(false);
                    setEditingMilestone(null);
                    setMilestoneForm({
                        name: "",
                        description: "",
                        dueDate: "",
                    });
                }}
                title={editingMilestone ? "Sửa milestone" : "Tạo milestone mới"}
            >
                <form
                    onSubmit={
                        editingMilestone
                            ? handleUpdateMilestone
                            : handleCreateMilestone
                    }
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Tên milestone
                        </label>
                        <input
                            type="text"
                            value={milestoneForm.name}
                            onChange={(e) =>
                                setMilestoneForm({
                                    ...milestoneForm,
                                    name: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Mô tả
                        </label>
                        <textarea
                            value={milestoneForm.description}
                            onChange={(e) =>
                                setMilestoneForm({
                                    ...milestoneForm,
                                    description: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Ngày hạn
                        </label>
                        <input
                            type="date"
                            value={milestoneForm.dueDate}
                            onChange={(e) =>
                                setMilestoneForm({
                                    ...milestoneForm,
                                    dueDate: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    {milestoneError && (
                        <div className="text-red-500 text-sm">
                            {milestoneError}
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowMilestoneModal(false);
                                setEditingMilestone(null);
                                setMilestoneForm({
                                    name: "",
                                    description: "",
                                    dueDate: "",
                                });
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={milestoneLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {milestoneLoading
                                ? "Đang xử lý..."
                                : editingMilestone
                                ? "Cập nhật"
                                : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
