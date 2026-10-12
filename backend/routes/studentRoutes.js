const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const { createStudent } = require("../controllers/studentController");

const router = express.Router();

router.post("/", authenticate, createStudent);

module.exports = router;
