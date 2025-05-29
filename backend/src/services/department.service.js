const Department = require("../models/Department");
const User = require("../models/User");
const Project = require("../models/Project");

class DepartmentService {
    // Create a new department
    static async createDepartment(departmentData) {
        const department = new Department(departmentData);
        await department.save();
        return department;
    }

    // Get all departments
    static async getAllDepartments() {
        return Department.find()
            .populate("manager", "name email position")
            .populate("memberCount");
    }

    // Get department by ID
    static async getDepartmentById(id) {
        return Department.findById(id)
            .populate("manager", "name email position")
            .populate("memberCount");
    }

    // Update department
    static async updateDepartment(id, updates) {
        const allowedUpdates = ["name", "description", "manager"];
        const isValidOperation = Object.keys(updates).every((update) =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            throw new Error("Invalid updates!");
        }

        const department = await Department.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).populate("manager", "name email position");

        return department;
    }

    // Delete department
    static async deleteDepartment(id) {
        // Check if department has members
        const memberCount = await User.countDocuments({ department: id });
        if (memberCount > 0) {
            throw new Error("Cannot delete department with existing members");
        }
        const department = await Department.findByIdAndDelete(id);
        return department;
    }

    // Get department members
    static async getDepartmentMembers(id) {
        return User.find({ department: id })
            .select("name email position role")
            .sort({ name: 1 });
    }

    // Assign manager to department
    static async assignManager(departmentId, managerId) {
        const department = await Department.findById(departmentId);
        if (!department) {
            return null;
        }

        const manager = await User.findById(managerId);
        if (!manager) {
            throw new Error("Manager not found");
        }

        if (manager.role !== "manager") {
            throw new Error("User must have manager role");
        }

        department.manager = managerId;
        await department.save();

        return department.populate("manager", "name email position");
    }

    // Get department statistics
    static async getDepartmentStats(id) {
        const [memberCount, projectCount, activeProjects] = await Promise.all([
            User.countDocuments({ department: id }),
            Project.countDocuments({
                "members.user": {
                    $in: await User.find({ department: id }).select("_id"),
                },
            }),
            Project.countDocuments({
                "members.user": {
                    $in: await User.find({ department: id }).select("_id"),
                },
                status: "open",
            }),
        ]);

        return {
            memberCount,
            projectCount,
            activeProjects,
            completedProjects: projectCount - activeProjects,
        };
    }
}

module.exports = DepartmentService;
