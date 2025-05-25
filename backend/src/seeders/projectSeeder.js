const Project = require("../models/Project");

const seedProjects = async (users) => {
    try {
        // Delete existing projects
        await Project.deleteMany({});

        const projects = [
            {
                name: "Website Redesign",
                description: "Redesign the company website with modern UI/UX",
                status: "open",
                progress: 0,
                createdBy: users[1]._id, // Project Manager
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                members: [
                    {
                        user: users[1]._id,
                        role: "manager",
                    },
                    {
                        user: users[2]._id,
                        role: "member",
                    },
                ],
                milestones: [
                    {
                        name: "Design Phase",
                        description: "Complete website design and mockups",
                        dueDate: new Date(
                            Date.now() + 10 * 24 * 60 * 60 * 1000
                        ),
                        status: "pending",
                    },
                    {
                        name: "Development Phase",
                        description: "Implement the website design",
                        dueDate: new Date(
                            Date.now() + 20 * 24 * 60 * 60 * 1000
                        ),
                        status: "pending",
                    },
                    {
                        name: "Testing Phase",
                        description: "Test and fix bugs",
                        dueDate: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                        ),
                        status: "pending",
                    },
                ],
            },
            {
                name: "Mobile App Development",
                description:
                    "Develop a new mobile application for iOS and Android",
                status: "open",
                progress: 0,
                createdBy: users[1]._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
                members: [
                    {
                        user: users[1]._id,
                        role: "manager",
                    },
                    {
                        user: users[2]._id,
                        role: "member",
                    },
                ],
                milestones: [
                    {
                        name: "Planning Phase",
                        description: "Define app requirements and features",
                        dueDate: new Date(
                            Date.now() + 15 * 24 * 60 * 60 * 1000
                        ),
                        status: "pending",
                    },
                    {
                        name: "Development Phase",
                        description: "Implement app features",
                        dueDate: new Date(
                            Date.now() + 45 * 24 * 60 * 60 * 1000
                        ),
                        status: "pending",
                    },
                    {
                        name: "Testing & Launch",
                        description: "Test app and prepare for launch",
                        dueDate: new Date(
                            Date.now() + 60 * 24 * 60 * 60 * 1000
                        ),
                        status: "pending",
                    },
                ],
            },
        ];

        const createdProjects = await Project.insertMany(projects);
        console.log("Projects seeded successfully");
        return createdProjects;
    } catch (error) {
        console.error("Error seeding projects:", error);
        throw error;
    }
};

module.exports = seedProjects;
