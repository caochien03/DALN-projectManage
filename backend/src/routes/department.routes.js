const express = require("express");
const router = express.Router();
const DepartmentController = require("../controllers/department.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Search departments
router.get("/search", auth, DepartmentController.searchDepartments);

// Create department (admin only)
router.post(
    "/",
    auth,
    authorize(["admin"]),
    DepartmentController.createDepartment
);

// Get all departments
router.get("/", auth, DepartmentController.getAllDepartments);

// Get department by ID
router.get("/:id", auth, DepartmentController.getDepartmentById);

// Update department (admin only)
router.put(
    "/:id",
    auth,
    authorize(["admin"]),
    DepartmentController.updateDepartment
);

// Delete department (admin only)
router.delete(
    "/:id",
    auth,
    authorize(["admin"]),
    DepartmentController.deleteDepartment
);

// Get department members
router.get("/:id/members", auth, DepartmentController.getDepartmentMembers);

// Get department statistics
router.get("/:id/stats", auth, DepartmentController.getDepartmentStats);

module.exports = router;
