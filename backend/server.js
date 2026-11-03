require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const errorMiddleware = require("./middleware/errorMiddleware")
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const sectionRoutes = require("./routes/sectionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

app.use(helmet());

app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://student-management-wheat-seven.vercel.app"
//   ],
origin:"*",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Student Management API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/students" , studentRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((error)=>{
    console.log("Failed to connect to database :" , error.message);
    process.exit(1);
})