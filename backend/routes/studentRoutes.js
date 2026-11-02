const express = require("express");
const validateRequest = require("../middleware/validateRequest");
const authenticate = require("../middleware/authMiddleware");
const { createStudent , getAllStudents , getStudentByRollNumber,updateStudent , deleteStudent} = require("../controllers/studentController");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
     createStudentValidation,
     updateStudentValidation
}=require("../middleware/studentValidation");

const router = express.Router();

router.post(
    "/",
     authenticate,
     authorizeRoles("teacher","admin"),
     createStudentValidation,
     validateRequest,
      createStudent
    );
router.get("/" ,
     authenticate , 
     authorizeRoles("teacher","admin"),
     getAllStudents);
     //Get all the students
router.get("/roll/:rollNumber" ,
     authenticate ,
     authorizeRoles("teacher","admin"),
      getStudentByRollNumber);

router.patch("/roll/:rollNumber" ,
     authenticate ,
     authorizeRoles("teacher","admin"),
     updateStudentValidation,
     validateRequest,
     updateStudent);
router.delete("/roll/:rollNumber" ,
     authenticate ,
     authorizeRoles("teacher","admin"),
      deleteStudent);

module.exports = router;
