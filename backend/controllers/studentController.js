const Student = require("../models/Student");

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
const getAllStudents = async(req , res , next)=>{
    try {
        const students = await Student.find({
            createdBy:req.user.userId
        });
        return res.status(200).json({
            success : true,
            count : students.length,
            students
        });
    } catch (error) {
        next(error);
    }
}
const getStudentByRollNumber = async (req, res, next) => {
    try {
        const { rollNumber } = req.params;

        const student = await Student.findOne({
            rollNumber: rollNumber.trim(),
            createdBy: req.user.userId
        });

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

module.exports = {
createStudent,
getAllStudents,
getStudentByRollNumber
};
