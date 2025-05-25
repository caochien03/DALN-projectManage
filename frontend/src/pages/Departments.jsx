import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Grid, TextField, Box, CircularProgress } from "@mui/material";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import FormDialog from "../components/FormDialog";
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../services/department";

const departmentColumns = [
    { field: "name", headerName: "Name" },
    { field: "description", headerName: "Description" },
    { field: "manager", headerName: "Manager" },
    { field: "memberCount", headerName: "Members" },
];

const initialFormData = {
    name: "",
    description: "",
    manager: "",
};

function Departments() {
    const [open, setOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const queryClient = useQueryClient();

    const { data: departments, isLoading } = useQuery({
        queryKey: ["departments"],
        queryFn: getDepartments,
    });

    const createMutation = useMutation({
        mutationFn: createDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedDepartment(null);
        setFormData(initialFormData);
    };

    const handleEdit = (department) => {
        setSelectedDepartment(department);
        setFormData(department);
        setOpen(true);
    };

    const handleDelete = (department) => {
        if (
            window.confirm("Are you sure you want to delete this department?")
        ) {
            deleteMutation.mutate(department._id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedDepartment) {
            updateMutation.mutate({
                id: selectedDepartment._id,
                data: formData,
            });
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
            <PageHeader title="Departments" onAdd={handleOpen} />
            <DataTable
                columns={departmentColumns}
                data={departments}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <FormDialog
                open={open}
                onClose={handleClose}
                title={
                    selectedDepartment ? "Edit Department" : "Add Department"
                }
                onSubmit={handleSubmit}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            name="name"
                            label="Name"
                            fullWidth
                            required
                            value={formData.name}
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
                    <Grid item xs={12}>
                        <TextField
                            name="manager"
                            label="Manager"
                            fullWidth
                            value={formData.manager}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </FormDialog>
        </Box>
    );
}

export default Departments;
