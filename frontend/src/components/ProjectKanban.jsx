import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    IconButton,
    Menu,
    MenuItem,
    Chip,
} from "@mui/material";
import { MoreVert as MoreIcon, Add as AddIcon } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const statusColumns = {
    todo: { title: "To Do", color: "#e0e0e0" },
    in_progress: { title: "In Progress", color: "#fff3e0" },
    review: { title: "Review", color: "#e3f2fd" },
    completed: { title: "Completed", color: "#e8f5e9" },
};

const TaskCard = ({ task, onEdit, onDelete }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        onEdit(task);
    };

    const handleDelete = () => {
        handleMenuClose();
        onDelete(task);
    };

    return (
        <Card
            sx={{
                mb: 1,
                cursor: "pointer",
                "&:hover": {
                    boxShadow: 3,
                },
            }}
            onClick={() => onEdit(task)}
        >
            <CardContent sx={{ p: 1.5 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >
                    <Typography variant="subtitle1" noWrap>
                        {task.title}
                    </Typography>
                    <IconButton size="small" onClick={handleMenuOpen}>
                        <MoreIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    {task.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                        label={task.priority}
                        size="small"
                        color={
                            task.priority === "high"
                                ? "error"
                                : task.priority === "medium"
                                ? "warning"
                                : "success"
                        }
                    />
                    {task.assignedTo && (
                        <Chip
                            label={task.assignedTo.name}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleEdit}>Edit</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                </Menu>
            </CardContent>
        </Card>
    );
};

const Column = ({ title, tasks, color, onTaskEdit, onTaskDelete }) => {
    return (
        <Paper
            sx={{
                p: 1,
                backgroundColor: color,
                minHeight: 500,
                width: 300,
            }}
        >
            <Typography variant="h6" sx={{ mb: 2, px: 1 }}>
                {title}
            </Typography>
            <Droppable droppableId={title.toLowerCase().replace(" ", "_")}>
                {(provided) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ minHeight: 100 }}
                    >
                        {tasks.map((task, index) => (
                            <Draggable
                                key={task._id}
                                draggableId={task._id}
                                index={index}
                            >
                                {(provided) => (
                                    <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <TaskCard
                                            task={task}
                                            onEdit={onTaskEdit}
                                            onDelete={onTaskDelete}
                                        />
                                    </Box>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>
        </Paper>
    );
};

function ProjectKanban({
    tasks,
    onTaskEdit,
    onTaskDelete,
    onTaskStatusChange,
}) {
    const groupedTasks = Object.keys(statusColumns).reduce((acc, status) => {
        acc[status] = tasks.filter((task) => task.status === status);
        return acc;
    }, {});

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        onTaskStatusChange(draggableId, newStatus);
    };

    return (
        <Box sx={{ p: 2 }}>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        overflowX: "auto",
                        pb: 2,
                    }}
                >
                    {Object.entries(statusColumns).map(
                        ([status, { title, color }]) => (
                            <Column
                                key={status}
                                title={title}
                                tasks={groupedTasks[status] || []}
                                color={color}
                                onTaskEdit={onTaskEdit}
                                onTaskDelete={onTaskDelete}
                            />
                        )
                    )}
                </Box>
            </DragDropContext>
        </Box>
    );
}

export default ProjectKanban;
