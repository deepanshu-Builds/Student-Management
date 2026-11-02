
const { body } = require("express-validator");

const createStudentValidation = [
    body("name")
        .trim()
        .isString()
        .withMessage("Name must be a string")
        .bail()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters"),

    body("rollNumber")
        .isString()
        .withMessage("Roll number must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Roll number is required")
        .bail()
        .isLength({ max: 30 })
        .withMessage("Roll number cannot exceed 30 characters"),

    body("section")
        .isMongoId()
        .withMessage("A valid section ID is required")
];

const updateStudentValidation = [
    body("name")
        .optional()
        .isString()
        .withMessage("Name must be a string")
        .bail()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters"),

    body()
        .custom((value) => {
            const allowedFields = ["name"];
            const suppliedFields = Object.keys(value || {});

            if (suppliedFields.length === 0) {
                throw new Error("Provide at least one field to update");
            }

            const invalidFields = suppliedFields.filter(
                (field) => !allowedFields.includes(field)
            );

            if (invalidFields.length > 0) {
                throw new Error(
                    `Fields cannot be updated: ${invalidFields.join(", ")}`
                );
            }

            return true;
        })
];

module.exports = {
    createStudentValidation,
    updateStudentValidation
};
