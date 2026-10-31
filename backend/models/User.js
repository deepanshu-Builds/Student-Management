
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            select: false
        },

        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            unique: true,
            trim: true,
            minlength: [3, "Employee ID must be at least 3 characters"],
            maxlength: [30, "Employee ID cannot exceed 30 characters"]
        },

        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true,
            minlength: [2, "Department must be at least 2 characters"],
            maxlength: [50, "Department cannot exceed 50 characters"]
        },

        role: {
            type: String,
            enum: ["teacher", "admin"],
            default: "teacher",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
