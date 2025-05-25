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
import { getUsers, createUser, updateUser, deleteUser } from "../services/user";

const userColumns = [
    { field: "name", headerName: "Name" },
    { field: "email", headerName: "Email" },
    { field: "role", headerName: "Role", type: "status" },
    { field: "department", headerName: "Department" },
    { field: "position", headerName: "Position" },
];

const initialFormData = {
    name: "",
    email: "",
    password: "",
    role: "user",
    department: "",
    position: "",
};

function Users() {
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const queryClient = useQueryClient();

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedUser(null);
        setFormData(initialFormData);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            ...user,
            password: "", // Don't show password when editing
        });
        setOpen(true);
    };

    const handleDelete = (user) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            deleteMutation.mutate(user._id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedUser) {
            updateMutation.mutate({ id: selectedUser._id, data: formData });
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
            <PageHeader title="Users" onAdd={handleOpen} />
            <DataTable
                columns={userColumns}
                data={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <FormDialog
                open={open}
                onClose={handleClose}
                title={selectedUser ? "Edit User" : "Add User"}
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
                            name="email"
                            label="Email"
                            type="email"
                            fullWidth
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Grid>
                    {!selectedUser && (
                        <Grid item xs={12}>
                            <TextField
                                name="password"
                                label="Password"
                                type="password"
                                fullWidth
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="role"
                            label="Role"
                            fullWidth
                            select
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="manager">Manager</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="department"
                            label="Department"
                            fullWidth
                            value={formData.department}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="position"
                            label="Position"
                            fullWidth
                            value={formData.position}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </FormDialog>
        </Box>
    );
}

export default Users;
