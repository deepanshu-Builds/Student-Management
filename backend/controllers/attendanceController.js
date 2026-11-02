
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Section = require("../models/Section");
const Student = require("../models/Student");

// Create or update attendance
const markAttendance = async (req, res, next) => {
    try {
        const { sectionId, subject, date, records } = req.body;

        if (!mongoose.isValidObjectId(sectionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID"
            });
        }

        const section = await Section.findOne({
            _id: sectionId,
            isActive: true
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found"
            });
        }

        // Validate subject
        if (!subject || typeof subject !== "string") {
            return res.status(400).json({
                success: false,
                message: "Subject is required"
            });
        }

        const sectionSubjects = section.subjects.map(
            item => item.name.toLowerCase()
        );

        if (!sectionSubjects.includes(subject.trim().toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Subject does not belong to this section"
            });
        }

        // Validate attendance records
        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Attendance records are required"
            });
        }

        const submittedStudentIds = records.map(
            record => record.student?.toString()
        );

        // Check whether submitted students belong to this section
        const validStudents = await Student.find({
            _id: { $in: submittedStudentIds },
            section: sectionId,
            isActive: true
        }).select("_id");

        const validStudentIds = new Set(
            validStudents.map(student => student._id.toString())
        );

        const invalidStudents = submittedStudentIds.filter(
            id => !mongoose.isValidObjectId(id) ||
                !validStudentIds.has(id)
        );

        if (invalidStudents.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some students do not belong to this section"
            });
        }

        // Validate attendance status
        const invalidRecords = records.some(
            record => !["Present", "Absent"].includes(record.status)
        );

        if (invalidRecords) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance status"
            });
        }

        // Validate date
        const normalizedDate = new Date(date);

        if (Number.isNaN(normalizedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance date"
            });
        }

        normalizedDate.setUTCHours(0, 0, 0, 0);

        // Create or update attendance
        const attendance = await Attendance.findOneAndUpdate(
            {
                section: sectionId,
                subject: subject.trim(),
                date: normalizedDate
            },
            {
                $set: {
                    records,
                    markedBy: req.user.userId
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        ).populate("records.student", "name rollNumber");

        return res.status(200).json({
            success: true,
            message: "Attendance saved successfully",
            attendance
        });

    } catch (error) {
        next(error);
    }
};


// Get attendance by section, subject and date
const getAttendance = async (req, res, next) => {
    try {
        const { sectionId, subject, date } = req.query;

        if (!mongoose.isValidObjectId(sectionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID"
            });
        }

        if (!subject || !date) {
            return res.status(400).json({
                success: false,
                message: "Subject and date are required"
            });
        }

        const selectedDate = new Date(date);

        if (Number.isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date"
            });
        }

        selectedDate.setUTCHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            section: sectionId,
            subject: subject.trim(),
            date: selectedDate
        }).populate("records.student", "name rollNumber department");

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        return res.status(200).json({
            success: true,
            attendance
        });

    } catch (error) {
        next(error);
    }
};


// Get all attendance records of a section
const getSectionAttendance = async (req, res, next) => {
    try {
        const { sectionId } = req.params;

        if (!mongoose.isValidObjectId(sectionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID"
            });
        }

        const attendance = await Attendance.find({
            section: sectionId
        })
            .populate("records.student", "name rollNumber")
            .populate("markedBy", "name email")
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            count: attendance.length,
            attendance
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    markAttendance,
    getAttendance,
    getSectionAttendance
};
