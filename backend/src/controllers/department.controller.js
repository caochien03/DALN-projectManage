const DepartmentService = require("../services/department.service");

class DepartmentController {
    // Create a new department
    static async createDepartment(req, res) {
        try {
            // Validate required fields
            const { name, description, manager } = req.body;

            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Tên phòng ban là bắt buộc",
                });
            }

            // Check if department name already exists
            const existingDepartment =
                await DepartmentService.getDepartmentByName(name.trim());
            if (existingDepartment) {
                return res.status(400).json({
                    success: false,
                    message: "Tên phòng ban đã tồn tại",
                });
            }

            const department = await DepartmentService.createDepartment({
                name: name.trim(),
                description: description?.trim(),
                manager: manager || null,
            });

            res.status(201).json({
                success: true,
                message: "Tạo phòng ban thành công!",
                data: department,
            });
        } catch (error) {
            console.error("Error creating department:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Có lỗi xảy ra khi tạo phòng ban",
            });
        }
    }

    // Get all departments
    static async getAllDepartments(req, res) {
        try {
            const departments = await DepartmentService.getAllDepartments();
            res.json({
                success: true,
                data: departments.map((d) => d.toObject({ virtuals: true })),
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get department by ID
    static async getDepartmentById(req, res) {
        try {
            const { id } = req.params;

            if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID phòng ban không hợp lệ",
                });
            }

            const department = await DepartmentService.getDepartmentById(id);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy phòng ban",
                });
            }
            res.json({ success: true, data: department });
        } catch (error) {
            console.error("Error getting department:", error);
            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Có lỗi xảy ra khi lấy thông tin phòng ban",
            });
        }
    }

    // Update department
    static async updateDepartment(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID phòng ban không hợp lệ",
                });
            }

            // Validate name if provided
            if (updates.name && updates.name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Tên phòng ban không được để trống",
                });
            }

            // Check if new name already exists (if name is being updated)
            if (updates.name) {
                const existingDepartment =
                    await DepartmentService.getDepartmentByName(
                        updates.name.trim(),
                        id
                    );
                if (existingDepartment) {
                    return res.status(400).json({
                        success: false,
                        message: "Tên phòng ban đã tồn tại",
                    });
                }
            }

            const department = await DepartmentService.updateDepartment(
                id,
                updates
            );
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy phòng ban",
                });
            }
            res.json({
                success: true,
                message: "Cập nhật phòng ban thành công!",
                data: department,
            });
        } catch (error) {
            console.error("Error updating department:", error);
            res.status(400).json({
                success: false,
                message:
                    error.message || "Có lỗi xảy ra khi cập nhật phòng ban",
            });
        }
    }

    // Delete department
    static async deleteDepartment(req, res) {
        try {
            const { id } = req.params;
            const { force, userAction } = req.query;

            if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID phòng ban không hợp lệ",
                });
            }

            // Validate userAction
            const validUserActions = ["null", "deactivate", "move"];
            if (userAction && !validUserActions.includes(userAction)) {
                return res.status(400).json({
                    success: false,
                    message: `userAction không hợp lệ. Các giá trị cho phép: ${validUserActions.join(
                        ", "
                    )}`,
                });
            }

            const result = await DepartmentService.deleteDepartment(
                id,
                force === "true",
                userAction || "null"
            );

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                });
            }

            res.json({
                success: true,
                message: result.message,
                data: {
                    department: result.department,
                    affectedUsers: result.affectedUsers,
                    userAction: result.userAction,
                },
            });
        } catch (error) {
            console.error("Error deleting department:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Có lỗi xảy ra khi xóa phòng ban",
            });
        }
    }

    // Get department members
    static async getDepartmentMembers(req, res) {
        try {
            const { id } = req.params;

            if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID phòng ban không hợp lệ",
                });
            }

            const members = await DepartmentService.getDepartmentMembers(id);
            res.json({
                success: true,
                data: members,
                count: members.length,
            });
        } catch (error) {
            console.error("Error getting department members:", error);
            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Có lỗi xảy ra khi lấy danh sách thành viên",
            });
        }
    }

    // Get department statistics
    static async getDepartmentStats(req, res) {
        try {
            const { id } = req.params;

            if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID phòng ban không hợp lệ",
                });
            }

            const stats = await DepartmentService.getDepartmentStats(id);
            res.json({ success: true, data: stats });
        } catch (error) {
            console.error("Error getting department stats:", error);
            res.status(500).json({
                success: false,
                message:
                    error.message || "Có lỗi xảy ra khi lấy thống kê phòng ban",
            });
        }
    }

    // Search departments
    static async searchDepartments(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Từ khóa tìm kiếm không được để trống",
                });
            }

            const departments = await DepartmentService.searchDepartments(
                q.trim()
            );

            res.json({
                success: true,
                data: departments,
                count: departments.length,
                searchTerm: q.trim(),
            });
        } catch (error) {
            console.error("Error searching departments:", error);
            res.status(500).json({
                success: false,
                message:
                    error.message || "Có lỗi xảy ra khi tìm kiếm phòng ban",
            });
        }
    }
}

module.exports = DepartmentController;
