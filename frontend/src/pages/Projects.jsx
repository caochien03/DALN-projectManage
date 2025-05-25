import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Grid,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import FormDialog from "../components/FormDialog";
import ProjectKanban from "../components/ProjectKanban";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
} from "../services/project";
import {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
} from "../services/task";

const projectColumns = [
    { field: "name", headerName: "Name" },
    { field: "description", headerName: "Description" },
    { field: "status", headerName: "Status", type: "status" },
    { field: "progress", headerName: "Progress" },
    { field: "startDate", headerName: "Start Date" },
    { field: "endDate", headerName: "End Date" },
];

const initialProjectData = {
    name: "",
    description: "",
    status: "open",
    startDate: "",
    endDate: "",
    members: [],
};

const initialTaskData = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    startDate: "",
    dueDate: "",
    assignedTo: "",
};

function Projects() {
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [projectFormData, setProjectFormData] = useState(initialProjectData);
    const [taskFormData, setTaskFormData] = useState(initialTaskData);
    const queryClient = useQueryClient();

    const { data: projects, isLoading: projectsLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
    });

    const { data: projectTasks, isLoading: tasksLoading } = useQuery({
        queryKey: ["projectTasks", selectedProject?._id],
        queryFn: () => getTasksByProject(selectedProject?._id),
        enabled: !!selectedProject,
    });

    const createProjectMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            handleProjectDialogClose();
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: updateProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            handleProjectDialogClose();
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const createTaskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projectTasks", selectedProject?._id],
            });
            handleTaskDialogClose();
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projectTasks", selectedProject?._id],
            });
            handleTaskDialogClose();
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projectTasks", selectedProject?._id],
            });
        },
    });

    const handleProjectDialogOpen = () => {
        setProjectDialogOpen(true);
    };

    const handleProjectDialogClose = () => {
        setProjectDialogOpen(false);
        setSelectedProject(null);
        setProjectFormData(initialProjectData);
    };

    const handleTaskDialogOpen = () => {
        setTaskDialogOpen(true);
    };

    const handleTaskDialogClose = () => {
        setTaskDialogOpen(false);
        setSelectedTask(null);
        setTaskFormData(initialTaskData);
    };

    const handleProjectEdit = (project) => {
        setSelectedProject(project);
        setProjectFormData({
            ...project,
            startDate: new Date(project.startDate).toISOString().split("T")[0],
            endDate: new Date(project.endDate).toISOString().split("T")[0],
        });
        setProjectDialogOpen(true);
    };

    const handleProjectDelete = (project) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            deleteProjectMutation.mutate(project._id);
        }
    };

    const handleProjectSubmit = (e) => {
        e.preventDefault();
        if (selectedProject) {
            updateProjectMutation.mutate({
                id: selectedProject._id,
                data: projectFormData,
            });
        } else {
            createProjectMutation.mutate(projectFormData);
        }
    };

    const handleTaskEdit = (task) => {
        setSelectedTask(task);
        setTaskFormData({
            ...task,
            startDate: new Date(task.startDate).toISOString().split("T")[0],
            dueDate: new Date(task.dueDate).toISOString().split("T")[0],
        });
        setTaskDialogOpen(true);
    };

    const handleTaskDelete = (task) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            deleteTaskMutation.mutate(task._id);
        }
    };

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        const taskData = {
            ...taskFormData,
            project: selectedProject._id,
        };
        if (selectedTask) {
            updateTaskMutation.mutate({ id: selectedTask._id, data: taskData });
        } else {
            createTaskMutation.mutate(taskData);
        }
    };

    const handleTaskStatusChange = (taskId, newStatus) => {
        updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
    };

    const handleProjectChange = (e) => {
        setProjectFormData({
            ...projectFormData,
            [e.target.name]: e.target.value,
        });
    };

    const handleTaskChange = (e) => {
        setTaskFormData({
            ...taskFormData,
            [e.target.name]: e.target.value,
        });
    };

    if (projectsLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <PageHeader title="Projects" onAdd={handleProjectDialogOpen} />
            <DataTable
                columns={projectColumns}
                data={projects}
                onEdit={handleProjectEdit}
                onDelete={handleProjectDelete}
                onRowClick={(project) => setSelectedProject(project)}
            />

            <Dialog
                open={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6">
                            {selectedProject?.name} - Tasks
                        </Typography>
                        <Box>
                            <IconButton
                                onClick={handleTaskDialogOpen}
                                color="primary"
                            >
                                Add Task
                            </IconButton>
                            <IconButton
                                onClick={() => setSelectedProject(null)}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {tasksLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 4,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <ProjectKanban
                            tasks={projectTasks || []}
                            onTaskEdit={handleTaskEdit}
                            onTaskDelete={handleTaskDelete}
                            onTaskStatusChange={handleTaskStatusChange}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <FormDialog
                open={projectDialogOpen}
                onClose={handleProjectDialogClose}
                title={selectedProject ? "Edit Project" : "Add Project"}
                onSubmit={handleProjectSubmit}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            name="name"
                            label="Name"
                            fullWidth
                            required
                            value={projectFormData.name}
                            onChange={handleProjectChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={projectFormData.description}
                            onChange={handleProjectChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="status"
                            label="Status"
                            fullWidth
                            select
                            value={projectFormData.status}
                            onChange={handleProjectChange}
                        >
                            <MenuItem value="open">Open</MenuItem>
                            <MenuItem value="close">Close</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="startDate"
                            label="Start Date"
                            type="date"
                            fullWidth
                            required
                            value={projectFormData.startDate}
                            onChange={handleProjectChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="endDate"
                            label="End Date"
                            type="date"
                            fullWidth
                            required
                            value={projectFormData.endDate}
                            onChange={handleProjectChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </FormDialog>

            <FormDialog
                open={taskDialogOpen}
                onClose={handleTaskDialogClose}
                title={selectedTask ? "Edit Task" : "Add Task"}
                onSubmit={handleTaskSubmit}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            name="title"
                            label="Title"
                            fullWidth
                            required
                            value={taskFormData.title}
                            onChange={handleTaskChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={taskFormData.description}
                            onChange={handleTaskChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="status"
                            label="Status"
                            fullWidth
                            select
                            value={taskFormData.status}
                            onChange={handleTaskChange}
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
                            value={taskFormData.priority}
                            onChange={handleTaskChange}
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="startDate"
                            label="Start Date"
                            type="date"
                            fullWidth
                            required
                            value={taskFormData.startDate}
                            onChange={handleTaskChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="dueDate"
                            label="Due Date"
                            type="date"
                            fullWidth
                            required
                            value={taskFormData.dueDate}
                            onChange={handleTaskChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </FormDialog>
        </Box>
    );
}

export default Projects;
