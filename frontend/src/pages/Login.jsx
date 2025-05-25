import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
} from "@mui/material";
import { setCredentials } from "../store/slices/authSlice";
import { login } from "../services/auth";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(formData);

            if (!response.token) {
                throw new Error("No token received from server");
            }

            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));

            dispatch(
                setCredentials({
                    token: response.token,
                    user: response.user,
                })
            );

            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message || err.message || "Login failed"
            );
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
            }}
        >
            <Container component="main" maxWidth="xs">
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            mb: 3,
                            fontWeight: "bold",
                            color: "primary.main",
                        }}
                    >
                        Welcome Back
                    </Typography>
                    <Typography
                        component="h2"
                        variant="h6"
                        sx={{ mb: 3, color: "text.secondary" }}
                    >
                        Sign in to your account
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ width: "100%" }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                        {error && (
                            <Typography
                                color="error"
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    textAlign: "center",
                                    bgcolor: "error.light",
                                    color: "error.contrastText",
                                    py: 1,
                                    px: 2,
                                    borderRadius: 1,
                                }}
                            >
                                {error}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                fontSize: "1.1rem",
                                textTransform: "none",
                                borderRadius: 2,
                            }}
                        >
                            Sign In
                        </Button>
                        <Box
                            sx={{
                                textAlign: "center",
                                mt: 2,
                            }}
                        >
                            <Link
                                component="button"
                                variant="body2"
                                to="/forgot-password"
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                Forgot password?
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default Login;
