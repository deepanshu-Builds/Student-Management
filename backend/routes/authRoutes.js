
const express = require("express");
const { body } = require("express-validator");
const authenticate = require("../middleware/authMiddleware");

console.log("AUTH ROUTES LOADED");

const {
    register,
    login,
    logout,
    refresh
} = require("../controllers/authController");

const validateRequest = require("../middleware/validateRequest");

const router = express.Router();
router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user
    });
});

router.post(
    "/register",

    [
        body("name")
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("Name must be between 2 and 50 characters"),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Valid email is required"),

        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters"),

        body("employeeId")
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage("Valid employee ID is required"),

        body("department")
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("Department is required")
    ],

    validateRequest,
    register
);


router.post(
    "/login",

    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Valid email is required"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],

    validateRequest,
    login
);


router.post("/logout", logout);
router.post("/refresh" , refresh);

module.exports = router;