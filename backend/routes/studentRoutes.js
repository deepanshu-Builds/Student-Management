const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const { createStudent , getAllStudents , getStudentByRollNumber,updateStudent , deleteStudent} = require("../controllers/studentController");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
     authenticate,
     authorizeRoles("teacher","admin"),
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
     updateStudent);
router.delete("/roll/:rollNumber" ,
     authenticate ,
     authorizeRoles("admin"),
      deleteStudent);

module.exports = router;
