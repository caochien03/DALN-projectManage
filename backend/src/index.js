const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const departmentRoutes = require("./routes/department.routes");
const documentRoutes = require("./routes/document.route");
const commentRoutes = require("./routes/comment.route");
const notificationRoutes = require("./routes/notification.routes");

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api", documentRoutes);
app.use("/api", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        // Khởi tạo notification scheduler
        const NotificationScheduler = require("./services/notificationScheduler");
        NotificationScheduler.init();
    })
    .catch((err) => console.error("MongoDB connection error:", err));

// Basic route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Project Management API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
