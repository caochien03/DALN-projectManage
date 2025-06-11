import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllUsers } from "../services/user";
import { getAllDepartments } from "../services/department";
import axiosInstance from "../utils/axios";
import { createTask, updateTask, deleteTask } from "../services/task";
import Modal from "../components/Modal";
import TaskBoard from "../components/TaskBoard";

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

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projectRes, usersRes, departmentsRes] = await Promise.all([
                axiosInstance.get(`/api/projects/${id}`),
                getAllUsers(),
                getAllDepartments(),
            ]);
            setProject(projectRes.data);
            setTasks(projectRes.data.tasks || []);
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
        if (!window.confirm("Bạn có chắc chắn muốn xóa task này?")) return;
        setTaskLoading(true);
        try {
            await deleteTask(taskId);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Không thể xóa task");
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
                if (typeof m.user === "object" && m.user._id) return m.user;
                return users.find((u) => u._id === m.user || u.id === m.user);
            })
            .filter(Boolean) || [];

    if (loading) return <div className="p-8">Đang tải...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!project) return <div className="p-8">Không tìm thấy project</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-2 text-gray-700">
                        Mô tả: {project.description}
                    </div>
                    <div className="mb-2 text-gray-700">
                        Trạng thái: {project.status}
                    </div>
                    <div className="mb-2 text-gray-700">
                        Tiến độ: {project.progress}%
                    </div>
                    <div className="mb-2 text-gray-700">
                        Ngày bắt đầu: {project.startDate?.slice(0, 10)}
                    </div>
                    <div className="mb-2 text-gray-700">
                        Ngày kết thúc: {project.endDate?.slice(0, 10)}
                    </div>
                    <div className="mb-2 text-gray-700">
                        Manager:{" "}
                        {project.manager?.name || getUserName(project.manager)}
                    </div>
                </div>
                <div>
                    <div className="mb-2 text-gray-700">
                        Phòng ban:{" "}
                        {project.departments
                            ?.map((d) => getDepartmentName(d))
                            .join(", ")}
                    </div>
                    <div className="mb-2 text-gray-700">
                        Thành viên:{" "}
                        {projectMembers.map((m) => m.name).join(", ")}
                    </div>
                </div>
            </div>

            <TaskBoard
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskEdit={openEditTask}
                onTaskDelete={handleDeleteTask}
                getUserName={getUserName}
                onTaskStatusChangeOptimistic={handleTaskStatusChangeOptimistic}
            />

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
                            {projectMembers.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name}
                                </option>
                            ))}
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
                            {project.milestones?.map((milestone) => (
                                <option
                                    key={milestone._id}
                                    value={milestone._id}
                                >
                                    {milestone.name}
                                </option>
                            ))}
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
        </div>
    );
}
