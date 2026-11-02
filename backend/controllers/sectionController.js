
const mongoose = require("mongoose");
const Section = require("../models/Section");
const Student = require("../models/Student");

// CREATE SECTION
const createSection = async (req, res, next) => {
    try {
        const { name, year, subjects } = req.body;

        const existingSection = await Section.findOne({
            name: name.trim(),
            year,
            isActive: true
        });

        if (existingSection) {
            return res.status(409).json({
                success: false,
                message: "This section already exists for this year"
            });
        }

        const section = await Section.create({
            name,
            year,
            subjects,
            createdBy: req.user.userId
        });

        return res.status(201).json({
            success: true,
            message: "Section created successfully",
            section
        });
    } catch (error) {
        next(error);
    }
};

// GET ALL SECTIONS
const getAllSections = async (req, res, next) => {
    try {
        const sections = await Section.find({
            isActive: true
        })
            .populate("students", "name rollNumber department year")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            totalSections: sections.length,
            sections
        });
    } catch (error) {
        next(error);
    }
};

// GET SECTION BY ID
const getSectionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID"
            });
        }

        const section = await Section.findOne({
            _id: id,
            isActive: true
        }).populate("students", "name rollNumber department year");

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found"
            });
        }

        return res.status(200).json({
            success: true,
            section
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE SECTION
const updateSection = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID"
            });
        }

        const allowedFields = ["name", "year", "subjects"];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const section = await Section.findOneAndUpdate(
            {
                _id: id,
                isActive: true
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            section
        });
    } catch (error) {
        next(error);
    }
};

// ADD STUDENTS TO SECTION
const addStudentsToSection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { studentIds } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID"
            });
        }

        if (
            !Array.isArray(studentIds) ||
            studentIds.length === 0 ||
            studentIds.some(studentId => !mongoose.isValidObjectId(studentId))
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide valid student IDs"
            });
        }

        const uniqueIds = [...new Set(studentIds.map(String))];

        const students = await Student.find({
            _id: { $in: uniqueIds },
            isActive: true
        }).select("_id");

        if (students.length !== uniqueIds.length) {
            return res.status(400).json({
                success: false,
                message: "One or more students do not exist or are inactive"
            });
        }

        const section = await Section.findOneAndUpdate(
            {
                _id: id,
                isActive: true
            },
            {
                $addToSet: {
                    students: { $each: uniqueIds }
                }
            },
            {
                new: true
            }
        ).populate("students", "name rollNumber department year");

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Students added to section successfully",
            section
        });
    } catch (error) {
        next(error);
    }
};

// REMOVE STUDENT FROM SECTION
const removeStudentFromSection = async (req, res, next) => {
    try {
        const { id, studentId } = req.params;

        if (
            !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(studentId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid section or student ID"
            });
        }

        const section = await Section.findOneAndUpdate(
            {
                _id: id,
                isActive: true
            },
            {
                $pull: { students: studentId }
            },
            {
                new: true
            }
        ).populate("students", "name rollNumber department year");

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student removed from section",
            section
        });
    } catch (error) {
        next(error);
    }
};

// DELETE SECTION (SOFT DELETE)
const deleteSection = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID"
            });
        }

        const section = await Section.findOneAndUpdate(
            {
                _id: id,
                isActive: true
            },
            {
                $set: { isActive: false }
            },
            {
                new: true
            }
        );

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Section deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSection,
    getAllSections,
    getSectionById,
    updateSection,
    addStudentsToSection,
    removeStudentFromSection,
    deleteSection
};
