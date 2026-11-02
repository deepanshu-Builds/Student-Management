
const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
    createSection,
    getAllSections,
    getSectionById,
    updateSection,
    addStudentsToSection,
    removeStudentFromSection,
    deleteSection
} = require("../controllers/sectionController");

const {
    createSectionValidation,
    updateSectionValidation
} = require("../middleware/sectionValidation");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("teacher", "admin"));

router.post(
    "/",
    createSectionValidation,
    validateRequest,
    createSection
);

router.get("/", getAllSections);

router.get("/:id", getSectionById);

router.patch(
    "/:id",
    updateSectionValidation,
    validateRequest,
    updateSection
);

router.post("/:id/students", addStudentsToSection);

router.delete(
    "/:id/students/:studentId",
    removeStudentFromSection
);

router.delete("/:id", deleteSection);

module.exports = router;
