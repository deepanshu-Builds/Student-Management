const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
{
name: {
type: String,
required: [true, "Student name is required"],
trim: true,
minlength: 2,
maxlength: 100
},

    rollNumber: {
        type: String,
        required: [true, "Roll number is required"],
        trim: true,
        unique: true
    },

    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true
    },

    year: {
        type: Number,
        required: [true, "Student year is required"],
        min: 1,
        max: 4
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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

module.exports = mongoose.model("Student", studentSchema);