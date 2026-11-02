
const { body } = require("express-validator");

const createSectionValidation = [
    body("name")
        .trim()
        .isString()
        .isLength({ min: 2, max: 50 })
        .withMessage("Section name must be between 2 and 50 characters"),

    body("year")
        .isInt({ min: 1, max: 4 })
        .withMessage("Year must be between 1 and 4")
        .toInt(),

    body("subjects")
        .isArray({ min: 1, max: 20 })
        .withMessage("At least one subject is required"),

    body("subjects.*.name")
        .trim()
        .isString()
        .isLength({ min: 2, max: 100 })
        .withMessage("Subject name must be between 2 and 100 characters")
];

const updateSectionValidation = [
    body("name")
        .optional()
        .trim()
        .isString()
        .isLength({ min: 2, max: 50 })
        .withMessage("Invalid section name"),

    body("year")
        .optional()
        .isInt({ min: 1, max: 4 })
        .withMessage("Year must be between 1 and 4")
        .toInt(),

    body("subjects")
        .optional()
        .isArray({ min: 1, max: 20 })
        .withMessage("Subjects must contain between 1 and 20 items"),

    body("subjects.*.name")
        .if(body("subjects").exists())
        .trim()
        .isString()
        .isLength({ min: 2, max: 100 })
        .withMessage("Invalid subject name"),

    body()
        .custom((value) => {
            const allowedFields = ["name", "year", "subjects"];
            const suppliedFields = Object.keys(value || {});

            if (suppliedFields.length === 0) {
                throw new Error("Provide at least one field to update");
            }

            const invalidFields = suppliedFields.filter(
                field => !allowedFields.includes(field)
            );

            if (invalidFields.length) {
                throw new Error(
                    `Fields cannot be updated: ${invalidFields.join(", ")}`
                );
            }

            return true;
        })
];

module.exports = {
    createSectionValidation,
    updateSectionValidation
};
