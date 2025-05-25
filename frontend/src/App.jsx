import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import theme from "./theme";
import store from "./store";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Departments from "./pages/Departments";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import { setNavigate } from "./utils/navigation";

const queryClient = new QueryClient();

function AppRoutes() {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate]);

    return (
        <Routes>
            <Route
                path="/login"
                element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
            />
            <Route
                path="/forgot-password"
                element={
                    !isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />
                }
            />
            <Route
                path="/"
                element={
                    isAuthenticated ? <MainLayout /> : <Navigate to="/login" />
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="departments" element={<Departments />} />
                <Route path="users" element={<Users />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Router>
                        <AppRoutes />
                    </Router>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>
    );
}

export default App;
