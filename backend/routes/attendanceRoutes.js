
const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
    markAttendance,
    getAttendance,
    getSectionAttendance
} = require("../controllers/attendanceController");

const {
    markAttendanceValidation,
    getAttendanceValidation,
    getSectionAttendanceValidation
} = require("../middleware/attendanceValidation");

const router = express.Router();

// All routes require authentication and teacher/admin role
router.use(authenticate);
router.use(authorizeRoles("teacher", "admin"));

// Mark or update attendance
router.post(
    "/",
    markAttendanceValidation,
    validateRequest,
    markAttendance
);

// Get attendance by section, subject and date
router.get(
    "/",
    getAttendanceValidation,
    validateRequest,
    getAttendance
);

// Get all attendance records of a section
router.get(
    "/section/:sectionId",
    getSectionAttendanceValidation,
    validateRequest,
    getSectionAttendance
);

module.exports = router;
