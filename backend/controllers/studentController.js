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

module.exports = {
createStudent
};
