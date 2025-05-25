import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../services/auth";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const forgotPasswordMutation = useMutation({
        mutationFn: forgotPassword,
        onSuccess: () => {
            setSuccess(true);
            setError("");
        },
        onError: (error) => {
            setError(
                error.response?.data?.message || "Failed to send reset email"
            );
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        forgotPasswordMutation.mutate(email);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>
                        Forgot Password
                    </Typography>
                    {success ? (
                        <Box sx={{ textAlign: "center" }}>
                            <Typography color="success.main" sx={{ mb: 2 }}>
                                Password reset instructions have been sent to
                                your email.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate("/login")}
                            >
                                Back to Login
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ mt: 1, width: "100%" }}
                        >
                            <Typography sx={{ mb: 2 }}>
                                Enter your email address and we'll send you
                                instructions to reset your password.
                            </Typography>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {error && (
                                <Typography color="error" sx={{ mt: 2 }}>
                                    {error}
                                </Typography>
                            )}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={forgotPasswordMutation.isPending}
                            >
                                {forgotPasswordMutation.isPending
                                    ? "Sending..."
                                    : "Send Reset Instructions"}
                            </Button>
                            <Box sx={{ textAlign: "center" }}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate("/login")}
                                >
                                    Back to Login
                                </Link>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}

export default ForgotPassword;
