import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../services/auth";

const ChangePasswordDialog = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            onClose();
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setError("");
        },
        onError: (error) => {
            setError(
                error.response?.data?.message || "Failed to change password"
            );
        },
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("New password must be at least 6 characters long");
            return;
        }

        changePasswordMutation.mutate({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Change Password</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Current Password"
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        {error && (
                            <Box sx={{ color: "error.main", mt: 1 }}>
                                {error}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={changePasswordMutation.isPending}
                    >
                        {changePasswordMutation.isPending
                            ? "Changing..."
                            : "Change Password"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ChangePasswordDialog;
