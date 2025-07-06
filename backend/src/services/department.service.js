const Department = require("../models/Department");
const User = require("../models/User");
const Project = require("../models/Project");

class DepartmentService {
    // Create a new department
    static async createDepartment(departmentData) {
        try {
            const department = new Department(departmentData);
            await department.save();
            return department;
        } catch (error) {
            if (error.code === 11000) {
                throw new Error("Tên phòng ban đã tồn tại");
            }
            throw error;
        }
    }

    // Get department by name
    static async getDepartmentByName(name, excludeId = null) {
        const query = { name: name.trim() };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        return Department.findOne(query);
    }

    // Get all departments
    static async getAllDepartments() {
        return Department.find().populate("memberCount").sort({ name: 1 });
    }

    // Get department by ID
    static async getDepartmentById(id) {
        return Department.findById(id).populate("memberCount");
    }

    // Update department
    static async updateDepartment(id, updates) {
        const allowedUpdates = ["name", "description"];
        const isValidOperation = Object.keys(updates).every((update) =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            throw new Error("Các trường cập nhật không hợp lệ!");
        }

        // Clean up updates
        if (updates.name) {
            updates.name = updates.name.trim();
        }
        if (updates.description) {
            updates.description = updates.description.trim();
        }

        const department = await Department.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!department) {
            throw new Error("Không tìm thấy phòng ban");
        }

        return department;
    }

    // Delete department
    static async deleteDepartment(id, force = false, userAction = "null") {
        const department = await Department.findById(id);
        if (!department) {
            return { success: false, message: "Không tìm thấy phòng ban" };
        }

        // Check if department has members
        const memberCount = await User.countDocuments({ department: id });

        if (memberCount > 0) {
            if (!force) {
                return {
                    success: false,
                    message: `Không thể xóa phòng ban có ${memberCount} thành viên. Sử dụng force=true để xóa cưỡng bức.`,
                };
            } else {
                // Force delete: handle users based on userAction
                switch (userAction) {
                    case "deactivate":
                        // Deactivate all users in the department
                        await User.updateMany(
                            { department: id },
                            { isActive: false }
                        );
                        break;

                    case "move":
                        // Move users to a default department (you can specify which one)
                        const defaultDepartment = await Department.findOne({
                            name: "Phòng Ban Khác",
                        });
                        if (defaultDepartment) {
                            await User.updateMany(
                                { department: id },
                                { department: defaultDepartment._id }
                            );
                        } else {
                            // If no default department, set to null
                            await User.updateMany(
                                { department: id },
                                { department: null }
                            );
                        }
                        break;

                    case "null":
                    default:
                        // Set department to null (current behavior)
                        await User.updateMany(
                            { department: id },
                            { department: null }
                        );
                        break;
                }
            }
        }

        const deletedDepartment = await Department.findByIdAndDelete(id);

        let actionMessage = "";
        switch (userAction) {
            case "deactivate":
                actionMessage = ` và vô hiệu hóa ${memberCount} thành viên`;
                break;
            case "move":
                actionMessage = ` và chuyển ${memberCount} thành viên sang phòng ban khác`;
                break;
            case "null":
            default:
                actionMessage = ` và gỡ bỏ ${memberCount} thành viên khỏi phòng ban`;
                break;
        }

        return {
            success: true,
            message: force
                ? `Xóa phòng ban thành công (cưỡng bức)${actionMessage}`
                : "Xóa phòng ban thành công",
            department: deletedDepartment,
            affectedUsers: memberCount,
            userAction: userAction,
        };
    }

    // Get department members
    static async getDepartmentMembers(id) {
        const query = { department: id };

        return User.find(query)
            .select("name email position role createdAt")
            .sort({ name: 1 });
    }

    // Get department statistics
    static async getDepartmentStats(id) {
        const department = await Department.findById(id);
        if (!department) {
            throw new Error("Không tìm thấy phòng ban");
        }

        // Lấy danh sách user thuộc phòng ban
        const userIds = (await User.find({ department: id }).select("_id")).map(
            (u) => u._id
        );

        // Đếm số dự án liên quan đến phòng ban (có thành viên thuộc phòng ban)
        const [memberCount, projectOpen, projectClose] = await Promise.all([
            userIds.length,
            Project.countDocuments({
                "members.user": { $in: userIds },
                status: "open",
            }),
            Project.countDocuments({
                "members.user": { $in: userIds },
                status: "close",
            }),
        ]);

        return {
            department: {
                id: department._id,
                name: department.name,
                description: department.description,
                createdAt: department.createdAt,
            },
            members: {
                total: memberCount,
            },
            projects: {
                open: projectOpen,
                close: projectClose,
                total: projectOpen + projectClose,
            },
        };
    }

    // Bulk operations
    static async bulkUpdateDepartments(updates) {
        const operations = updates.map((update) => ({
            updateOne: {
                filter: { _id: update.id },
                update: { $set: update.data },
            },
        }));

        const result = await Department.bulkWrite(operations);
        return result;
    }

    // Search departments
    static async searchDepartments(searchTerm) {
        const query = {
            $or: [
                { name: { $regex: searchTerm, $options: "i" } },
                { description: { $regex: searchTerm, $options: "i" } },
            ],
        };

        return Department.find(query).populate("memberCount").sort({ name: 1 });
    }
}

module.exports = DepartmentService;
