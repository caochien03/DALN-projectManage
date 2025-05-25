import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Grid,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import FormDialog from "../components/FormDialog";
import { getTasks, createTask, updateTask, deleteTask } from "../services/task";

const taskColumns = [
    { field: "title", headerName: "Title" },
    { field: "description", headerName: "Description" },
    { field: "status", headerName: "Status", type: "status" },
    { field: "priority", headerName: "Priority", type: "status" },
    { field: "dueDate", headerName: "Due Date" },
    { field: "assignedTo", headerName: "Assigned To" },
];

const initialFormData = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
};

function Tasks() {
    const [open, setOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const queryClient = useQueryClient();

    const { data: tasks, isLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    const createMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTask(null);
        setFormData(initialFormData);
    };

    const handleEdit = (task) => {
        setSelectedTask(task);
        setFormData(task);
        setOpen(true);
    };

    const handleDelete = (task) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            deleteMutation.mutate(task._id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedTask) {
            updateMutation.mutate({ id: selectedTask._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <PageHeader title="Tasks" onAdd={handleOpen} />
            <DataTable
                columns={taskColumns}
                data={tasks}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <FormDialog
                open={open}
                onClose={handleClose}
                title={selectedTask ? "Edit Task" : "Add Task"}
                onSubmit={handleSubmit}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            name="title"
                            label="Title"
                            fullWidth
                            required
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="status"
                            label="Status"
                            fullWidth
                            select
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="review">Review</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="priority"
                            label="Priority"
                            fullWidth
                            select
                            value={formData.priority}
                            onChange={handleChange}
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="dueDate"
                            label="Due Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="assignedTo"
                            label="Assigned To"
                            fullWidth
                            value={formData.assignedTo}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </FormDialog>
        </Box>
    );
}

export default Tasks;
