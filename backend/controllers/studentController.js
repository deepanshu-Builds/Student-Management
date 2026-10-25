
const Student = require("../models/Student");

// 1. Create Student
const createStudent = async (req, res, next) => {
    try {
        const { name, rollNumber, department, year } = req.body;

        const existingStudent = await Student.findOne({ rollNumber });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "Roll number already exists"
            });
        }

        const student = await Student.create({
            name,
            rollNumber,
            department,
            year,
            createdBy: req.user.userId
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


// 2. Get All Active Students
const getAllStudents = async (req, res, next) => {
    try {
        const students = await Student.find({
            createdBy: req.user.userId,
            isActive: true
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        next(error);
    }
};


// 3. Get Student by Roll Number
const getStudentByRollNumber = async (req, res, next) => {
    try {
        const { rollNumber } = req.params;

        const student = await Student.findOne({
            rollNumber: rollNumber.trim(),
            createdBy: req.user.userId,
            isActive: true
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Active student not found"
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


// 4. Update Student
const updateStudent = async (req, res, next) => {
    try {
        const { rollNumber } = req.params;
        const { name, department, year } = req.body;

        const updates = {};

        // Validate name
        if (name !== undefined) {
            if (
                typeof name !== "string" ||
                name.trim().length < 2 ||
                name.trim().length > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be between 2 and 100 characters"
                });
            }

            updates.name = name.trim();
        }

        // Validate department
        if (department !== undefined) {
            if (
                typeof department !== "string" ||
                department.trim().length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Department cannot be empty"
                });
            }

            updates.department = department.trim();
        }

        // Validate year
        if (year !== undefined) {
            if (!Number.isInteger(year) || year < 1 || year > 4) {
                return res.status(400).json({
                    success: false,
                    message: "Year must be 1, 2, or 3"
                });
            }

            updates.year = year;
        }

        // Ensure at least one field is provided
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one valid field to update"
            });
        }

        const student = await Student.findOneAndUpdate(
            {
                rollNumber: rollNumber.trim(),
                createdBy: req.user.userId,
                isActive: true
            },
            {
                $set: updates
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Active student not found"
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


// 5. Soft Delete Student
const deleteStudent = async (req, res, next) => {
    try {
        const { rollNumber } = req.params;

        const student = await Student.findOneAndUpdate(
            {
                rollNumber: rollNumber.trim(),
                createdBy: req.user.userId,
                isActive: true
            },
            {
                $set: {
                    isActive: false
                }
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Active student not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student deactivated successfully",
            student
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
