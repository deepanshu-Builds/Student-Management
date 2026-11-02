
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Section name is required"],
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        year: {
            type: Number,
            required: [true, "Year is required"],
            min: 1,
            max: 4
        },

        subjects: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                    minlength: 2,
                    maxlength: 100
                }
            }
        ],

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            }
        ],

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

sectionSchema.index(
    { name: 1, year: 1 },
    { unique: true }
);

module.exports = mongoose.model("Section", sectionSchema);
