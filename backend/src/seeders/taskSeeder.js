const Task = require("../models/Task");

const seedTasks = async (users, projects) => {
    try {
        // Delete existing tasks
        await Task.deleteMany({});

        const tasks = [
            {
                title: "Create Website Wireframes",
                description: "Design wireframes for the new website layout",
                status: "todo",
                priority: "high",
                project: projects[0]._id,
                assignedTo: users[2]._id,
                startDate: new Date(),
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                estimatedHours: 8,
                comments: [
                    {
                        user: users[1]._id,
                        content: "Please focus on mobile-first design",
                        createdAt: new Date(),
                    },
                ],
            },
            {
                title: "Implement Homepage",
                description: "Code the homepage according to the design",
                status: "todo",
                priority: "medium",
                project: projects[0]._id,
                assignedTo: users[2]._id,
                startDate: new Date(),
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                estimatedHours: 16,
                comments: [],
            },
            {
                title: "App Requirements Document",
                description:
                    "Create detailed requirements document for the mobile app",
                status: "todo",
                priority: "high",
                project: projects[1]._id,
                assignedTo: users[1]._id,
                startDate: new Date(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                estimatedHours: 12,
                comments: [],
            },
            {
                title: "Design App UI",
                description: "Design the user interface for the mobile app",
                status: "todo",
                priority: "high",
                project: projects[1]._id,
                assignedTo: users[2]._id,
                startDate: new Date(),
                dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                estimatedHours: 24,
                comments: [],
            },
        ];

        const createdTasks = await Task.insertMany(tasks);
        console.log("Tasks seeded successfully");
        return createdTasks;
    } catch (error) {
        console.error("Error seeding tasks:", error);
        throw error;
    }
};

module.exports = seedTasks;
