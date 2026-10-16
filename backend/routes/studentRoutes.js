const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const { createStudent , getAllStudents , getStudentByRollNumber,updateStudent , deleteStudent} = require("../controllers/studentController");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authenticate, createStudent);
router.get("/" , authenticate , getAllStudents);
router.get("/roll/:rollNumber" , authenticate , getStudentByRollNumber)
router.patch("/roll/:rollNumber" , authenticate , updateStudent);
router.delete("/roll/:rollNumber" , authenticate , deleteStudent)

module.exports = router;
