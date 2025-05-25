import { useQuery } from "@tanstack/react-query";
import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import {
    Assignment as TaskIcon,
    Group as UserIcon,
    Business as DepartmentIcon,
    Folder as ProjectIcon,
} from "@mui/icons-material";
import { getDashboardStats } from "../services/dashboard";
import { useSelector } from "react-redux";

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Paper
        sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: 140,
        }}
    >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Icon sx={{ color }} />
        </Box>
        <Typography component="p" variant="h4">
            {value}
        </Typography>
    </Paper>
);

function Dashboard() {
    const { token, user } = useSelector((state) => state.auth);

    const {
        data: stats,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: getDashboardStats,
        enabled: !!token,
        retry: false,
    });

    if (!token) {
        return null;
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    Error loading dashboard data
                </Typography>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Admin view
    if (user?.role === "admin") {
        return (
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Grid container spacing={3}>
                    <Grid xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Projects"
                            value={stats?.totalProjects || 0}
                            icon={ProjectIcon}
                            color="primary.main"
                        />
                    </Grid>
                    <Grid xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Tasks"
                            value={stats?.totalTasks || 0}
                            icon={TaskIcon}
                            color="success.main"
                        />
                    </Grid>
                    <Grid xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Users"
                            value={stats?.totalUsers || 0}
                            icon={UserIcon}
                            color="warning.main"
                        />
                    </Grid>
                    <Grid xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Departments"
                            value={stats?.totalDepartments || 0}
                            icon={DepartmentIcon}
                            color="error.main"
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Manager view
    if (user?.role === "manager") {
        return (
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Manager Dashboard
                </Typography>
                <Grid container spacing={3}>
                    <Grid xs={12} sm={6}>
                        <StatCard
                            title="My Projects"
                            value={stats?.myProjects || 0}
                            icon={ProjectIcon}
                            color="primary.main"
                        />
                    </Grid>
                    <Grid xs={12} sm={6}>
                        <StatCard
                            title="Team Tasks"
                            value={stats?.teamTasks || 0}
                            icon={TaskIcon}
                            color="success.main"
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Member view
    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid xs={12} sm={6}>
                    <StatCard
                        title="My Tasks"
                        value={stats?.myTasks || 0}
                        icon={TaskIcon}
                        color="primary.main"
                    />
                </Grid>
                <Grid xs={12} sm={6}>
                    <StatCard
                        title="My Projects"
                        value={stats?.myProjects || 0}
                        icon={ProjectIcon}
                        color="success.main"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;
