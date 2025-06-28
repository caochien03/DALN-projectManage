import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const TASK_STATUSES = [
    { key: "todo", label: "To Do" },
    { key: "in_progress", label: "In Progress" },
    { key: "review", label: "Review" },
    { key: "completed", label: "Completed" },
];

export default function TaskBoard({
    tasks,
    onTaskUpdate,
    onTaskEdit,
    onTaskDelete,
    getUserName,
    onTaskStatusChangeOptimistic,
    canEditTask,
    canDeleteTask,
}) {
    const getColumnColor = (status) => {
        switch (status) {
            case "todo":
                return "bg-blue-50";
            case "in_progress":
                return "bg-yellow-50";
            case "review":
                return "bg-purple-50";
            case "completed":
                return "bg-green-50";
            default:
                return "bg-gray-50";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-600";
            case "medium":
                return "bg-orange-100 text-orange-600";
            case "low":
                return "bg-blue-100 text-blue-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

    const getColumnTaskCount = (status) => {
        return tasksByStatus(status).length;
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId)
            return;

        const task = tasks.find((t) => t._id === draggableId);
        if (!task) return;

        // Optimistic update
        if (onTaskStatusChangeOptimistic) {
            onTaskStatusChangeOptimistic(task._id, destination.droppableId);
        }

        try {
            const taskData = {
                status: destination.droppableId,
                title: task.title,
                description: task.description || "",
                startDate: task.startDate,
                dueDate: task.dueDate,
            };
            await onTaskUpdate(task._id, taskData);
        } catch (error) {
            alert(
                error.response?.data?.error ||
                    "Không thể cập nhật trạng thái task"
            );
            // Optionally: revert UI here if needed
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-2 mt-8">Tasks (Kanban)</h2>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {TASK_STATUSES.map((col) => (
                        <Droppable droppableId={col.key} key={col.key}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`rounded p-2 min-h-[200px] ${getColumnColor(
                                        col.key
                                    )}`}
                                >
                                    <div className="font-semibold mb-2 flex justify-between items-center">
                                        <span>{col.label}</span>
                                        <span className="text-sm text-gray-500">
                                            {getColumnTaskCount(col.key)} tasks
                                        </span>
                                    </div>
                                    {tasksByStatus(col.key).map((task, idx) => (
                                        <Draggable
                                            draggableId={task._id}
                                            index={idx}
                                            key={task._id}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="bg-white rounded shadow p-2 mb-2"
                                                >
                                                    <div className="font-medium flex items-center gap-2">
                                                        {task.title}
                                                        <span
                                                            className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(
                                                                task.priority
                                                            )}`}
                                                        >
                                                            {task.priority ===
                                                            "high"
                                                                ? "Cao"
                                                                : task.priority ===
                                                                  "medium"
                                                                ? "Trung bình"
                                                                : "Thấp"}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {task.description}
                                                    </div>
                                                    <div className="text-xs mt-1">
                                                        Người thực hiện:{" "}
                                                        {getUserName(
                                                            task.assignedTo
                                                        )}
                                                    </div>
                                                    <div className="text-xs">
                                                        Hạn:{" "}
                                                        {task.dueDate?.slice(
                                                            0,
                                                            10
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        {canEditTask &&
                                                            canEditTask(
                                                                task
                                                            ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        onTaskEdit(
                                                                            task
                                                                        )
                                                                    }
                                                                    className="text-xs text-blue-600 hover:underline"
                                                                >
                                                                    Sửa
                                                                </button>
                                                            )}
                                                        {canDeleteTask &&
                                                            canDeleteTask() && (
                                                                <button
                                                                    onClick={() =>
                                                                        onTaskDelete(
                                                                            task._id
                                                                        )
                                                                    }
                                                                    className="text-xs text-red-600 hover:underline"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
