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
const updateStudent = async(req, res, next)=>{
try {
        const{rollNumber} = req.params;
    const{name , department , year}= req.body;
    const updates = {};
    if(name !== undefined){
        if(typeof name !=="string" || name.trim()<2 || name.trim()>100){
            res.status(400).json({
                success : false,
                message : "Name must be between 2 and 100 charecters"
            });
        }
        updates.name = name.trim();
    }
    if(department !== undefined){
        if(typeof department !== "string"){
            res.status(400).json({
                success:false,
                message:"Department Cannot be empty"
            });

        }
        updates.department = department.trim();
    }
    if(year!==undefined){
        if(!Number.isInteger(year)|| year<1 || year>4){
            res.status(400).json({
                success : false,
                message : "Year must 1 , 2 , or 3"
            });
        }
    }
    if(Object.keys(updates).length===0){
        return res.status(400).json({
            success : false,
            message : "Provide at least one valid field to update"
        });
    }
      const student = await Student.findOneAndUpdate(
        {
            rollNumber: rollNumber.trim(),
            createdBy: req.user.userId
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
}

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
        $set: { isActive: false }
      },
      {
        new: true
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
