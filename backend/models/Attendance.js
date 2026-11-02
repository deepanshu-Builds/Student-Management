
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        records: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student",
                    required: true
                },

                status: {
                    type: String,
                    enum: ["Present", "Absent"],
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// One attendance record per section, subject and date
attendanceSchema.index(
    { section: 1, subject: 1, date: 1 },
    { unique: true }
);

// Prevent duplicate student entries in one attendance document
attendanceSchema.path("records").validate(function (records) {
    const studentIds = records.map(record =>
        record.student.toString()
    );

    return studentIds.length === new Set(studentIds).size;
}, "Duplicate student entries are not allowed");

module.exports = mongoose.model("Attendance", attendanceSchema);
