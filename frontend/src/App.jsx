import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import ProjectDetail from "./pages/ProjectDetail";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
}

export default function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Router>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Projects />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Users />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/departments"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Departments />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/projects"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Projects />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/projects/:id"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <ProjectDetail />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Profile />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}
