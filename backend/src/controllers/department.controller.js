const DepartmentService = require("../services/department.service");

class DepartmentController {
    // Create a new department
    static async createDepartment(req, res) {
        try {
            const department = await DepartmentService.createDepartment(
                req.body
            );
            res.status(201).json({
                success: true,
                message: "Tạo phòng ban thành công!",
                data: department,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Get all departments
    static async getAllDepartments(req, res) {
        try {
            const departments = await DepartmentService.getAllDepartments();
            res.json({ success: true, data: departments });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get department by ID
    static async getDepartmentById(req, res) {
        try {
            const department = await DepartmentService.getDepartmentById(
                req.params.id
            );
            if (!department) {
                return res
                    .status(404)
                    .json({ success: false, message: "Department not found" });
            }
            res.json({ success: true, data: department });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Update department
    static async updateDepartment(req, res) {
        try {
            const department = await DepartmentService.updateDepartment(
                req.params.id,
                req.body
            );
            if (!department) {
                return res
                    .status(404)
                    .json({ success: false, message: "Department not found" });
            }
            res.json({
                success: true,
                message: "Cập nhật phòng ban thành công!",
                data: department,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Delete department
    static async deleteDepartment(req, res) {
        try {
            const department = await DepartmentService.deleteDepartment(
                req.params.id
            );
            if (!department) {
                return res
                    .status(404)
                    .json({ success: false, message: "Department not found" });
            }
            res.json({ success: true, message: "Xóa phòng ban thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get department members
    static async getDepartmentMembers(req, res) {
        try {
            const members = await DepartmentService.getDepartmentMembers(
                req.params.id
            );
            res.json({ success: true, data: members });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Assign manager to department
    static async assignManager(req, res) {
        try {
            const { managerId } = req.body;
            const department = await DepartmentService.assignManager(
                req.params.id,
                managerId
            );
            if (!department) {
                return res
                    .status(404)
                    .json({ success: false, message: "Department not found" });
            }
            res.json({
                success: true,
                message: "Gán trưởng phòng thành công!",
                data: department,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Get department statistics
    static async getDepartmentStats(req, res) {
        try {
            const stats = await DepartmentService.getDepartmentStats(
                req.params.id
            );
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = DepartmentController;
