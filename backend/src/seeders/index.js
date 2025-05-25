require("dotenv").config();
const mongoose = require("mongoose");
const seedDepartments = require("./departmentSeeder");
const seedUsers = require("./userSeeder");
const seedProjects = require("./projectSeeder");
const seedTasks = require("./taskSeeder");

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Seed departments first
        console.log("Starting to seed departments...");
        const departments = await seedDepartments();
        console.log("Departments seeded:", departments.length);

        // Seed users using the created departments
        console.log("Starting to seed users...");
        const users = await seedUsers(departments);
        console.log("Users seeded:", users.length);

        // Seed projects using the created users
        console.log("Starting to seed projects...");
        const projects = await seedProjects(users);
        console.log("Projects seeded:", projects.length);

        // Seed tasks using the created users and projects
        console.log("Starting to seed tasks...");
        const tasks = await seedTasks(users, projects);
        console.log("Tasks seeded:", tasks.length);

        console.log("Database seeding completed successfully");
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Run the seeder
seedDatabase();
