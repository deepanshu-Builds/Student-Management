
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    "https://student-management-hq1t.vercel.app",
    "https://student-management-wheat-seven.vercel.app",
    "https://student-management-8mmreircp-deepanshu1580-6375.vercel.app",
    "https://student-management-git-main-deepanshu1580-6375.vercel.app"
];

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without an origin (e.g. Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],
    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Student Management API is running"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

// Database connection and server startup
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
        process.exit(1);
    });
