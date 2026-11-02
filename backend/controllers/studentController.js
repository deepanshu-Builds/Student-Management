
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Section = require("../models/Section");

// All authenticated teachers and admins share student access.
const getOwnershipFilter = () => ({});

// CREATE STUDENT
const createStudent = async (req, res, next) => {
    try {
        const { name, rollNumber, section: sectionId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(sectionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID"
            });
        }

        const section = await Section.findOne({
            _id: sectionId,
            isActive: true
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found or inactive"
            });
        }

        const existingStudent = await Student.findOne({ rollNumber });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "Student with this roll number already exists"
            });
        }

        const student = await Student.create({
            name,
            rollNumber,
            department: section.name,
            year: section.year,
            section: section._id,
            createdBy: req.user.userId
        });

        await Section.findByIdAndUpdate(section._id, {
            $addToSet: { students: student._id }
        });

        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            student
        });
    } catch (error) {
        next(error);
    }
};

// GET ALL STUDENTS
const getAllStudents = async (req, res, next) => {
    try {
        const {
            search,
            department,
            year,
            section,
            page = "1",
            limit = "10",
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be >= 1 and limit must be between 1 and 100"
            });
        }

        const allowedSortFields = [
            "name",
            "rollNumber",
            "department",
            "year",
            "createdAt"
        ];

        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sortBy field"
            });
        }

        if (!["asc", "desc"].includes(order)) {
            return res.status(400).json({
                success: false,
                message: "Order must be asc or desc"
            });
        }

        const filter = {
            ...getOwnershipFilter(),
            isActive: true
        };

        if (search && search.trim()) {
            const searchTerm = search.trim().slice(0, 100);
            const escapedSearch = searchTerm.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                { name: { $regex: escapedSearch, $options: "i" } },
                { rollNumber: { $regex: escapedSearch, $options: "i" } }
            ];
        }

        if (department && department.trim()) {
            filter.department = department.trim();
        }

        if (year !== undefined) {
            const yearNumber = Number(year);

            if (
                !Number.isInteger(yearNumber) ||
                yearNumber < 1 ||
                yearNumber > 4
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Year must be between 1 and 4"
                });
            }

            filter.year = yearNumber;
        }

        if (section !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(section)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid section ID"
                });
            }

            filter.section = section;
        }

        const skip = (pageNumber - 1) * limitNumber;

        const [students, totalStudents] = await Promise.all([
            Student.find(filter)
                .populate("section", "name year")
                .sort({
                    [sortBy]: order === "asc" ? 1 : -1,
                    _id: 1
                })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            Student.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            pagination: {
                totalStudents,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalStudents / limitNumber),
                pageSize: limitNumber,
                hasNextPage: pageNumber * limitNumber < totalStudents,
                hasPreviousPage: pageNumber > 1
            },
            students
        });
    } catch (error) {
        next(error);
    }
};

// GET STUDENT BY ROLL NUMBER
const getStudentByRollNumber = async (req, res, next) => {
    try {
        const student = await Student.findOne({
            rollNumber: req.params.rollNumber,
            isActive: true,
            ...getOwnershipFilter()
        }).populate("section", "name year");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE STUDENT
const updateStudent = async (req, res, next) => {
    try {
        const allowedFields = ["name"];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const student = await Student.findOneAndUpdate(
            {
                rollNumber: req.params.rollNumber,
                isActive: true,
                ...getOwnershipFilter()
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        ).populate("section", "name year");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student updated successfully",
            student
        });
    } catch (error) {
        next(error);
    }
};

// DELETE STUDENT (SOFT DELETE)
const deleteStudent = async (req, res, next) => {
    try {
        const student = await Student.findOneAndUpdate(
            {
                rollNumber: req.params.rollNumber,
                isActive: true,
                ...getOwnershipFilter()
            },
            { $set: { isActive: false } },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await Section.findByIdAndUpdate(student.section, {
            $pull: { students: student._id }
        });

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentByRollNumber,
    updateStudent,
    deleteStudent
};
