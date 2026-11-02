
const { body, query, param } = require("express-validator");

const markAttendanceValidation = [
    body("sectionId")
        .isMongoId()
        .withMessage("Valid section ID is required"),

    body("subject")
        .isString()
        .bail()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Valid subject name is required"),

    body("date")
        .isISO8601()
        .withMessage("Valid date is required"),

    body("records")
        .isArray({ min: 1 })
        .withMessage("Attendance records are required"),

    body("records.*.student")
        .isMongoId()
        .withMessage("Valid student ID is required"),

    body("records.*.status")
        .isIn(["Present", "Absent"])
        .withMessage("Status must be Present or Absent")
];

const getAttendanceValidation = [
    query("sectionId")
        .isMongoId()
        .withMessage("Valid section ID is required"),

    query("subject")
        .isString()
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Subject is required"),

    query("date")
        .isISO8601()
        .withMessage("Valid date is required")
];

const getSectionAttendanceValidation = [
    param("sectionId")
        .isMongoId()
        .withMessage("Valid section ID is required")
];

module.exports = {
    markAttendanceValidation,
    getAttendanceValidation,
    getSectionAttendanceValidation
};
