const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedUsers = async (departments) => {
    try {
        // Delete existing users
        await User.deleteMany({});

        const users = [
            {
                name: "Admin User",
                email: "admin@example.com",
                password: "admin123",
                role: "admin",
                department: departments[0]._id, // IT Department
                position: "System Administrator",
            },
            {
                name: "Project Manager",
                email: "manager@example.com",
                password: "manager123",
                role: "manager",
                department: departments[1]._id, // Project Management Department
                position: "Project Manager",
            },
            {
                name: "Team Member",
                email: "member@example.com",
                password: "member123",
                role: "member",
                department: departments[2]._id, // Development Department
                position: "Developer",
            },
        ];

        // Hash passwords and create users
        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 8),
            }))
        );

        const createdUsers = await User.insertMany(hashedUsers);
        console.log("Users seeded successfully");
        return createdUsers;
    } catch (error) {
        console.error("Error seeding users:", error);
        throw error;
    }
};

module.exports = seedUsers;
