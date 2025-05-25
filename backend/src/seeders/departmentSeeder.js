const Department = require("../models/Department");

const seedDepartments = async () => {
    try {
        // Delete existing departments
        await Department.deleteMany({});

        const departments = [
            {
                name: "Information Technology",
                description:
                    "Handles all IT infrastructure and software development",
                isActive: true,
            },
            {
                name: "Project Management",
                description:
                    "Manages project planning, execution, and delivery",
                isActive: true,
            },
            {
                name: "Development",
                description: "Software development and engineering team",
                isActive: true,
            },
            {
                name: "Quality Assurance",
                description: "Ensures software quality and testing",
                isActive: true,
            },
            {
                name: "Design",
                description: "UI/UX and graphic design team",
                isActive: true,
            },
        ];

        const createdDepartments = await Department.insertMany(departments);
        console.log("Departments seeded successfully");
        return createdDepartments;
    } catch (error) {
        console.error("Error seeding departments:", error);
        throw error;
    }
};

module.exports = seedDepartments;
