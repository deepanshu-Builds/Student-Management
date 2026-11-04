const argon2 = require("argon2");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const generateTokens = require("../utils/generateTokens");
const hashToken = require("../utils/hashTokens");

const isProd = process.env.NODE_ENV === "production";

// cookie options ek hi jagah rakhe hain taaki login / refresh / logout
// teeno me same rahein (mismatch hone se hi logout wala bug aaya tha)
const cookieBase = {
    httpOnly: true,
    secure: isProd,
    // prod me frontend (vercel) aur backend (render) alag site hain -> "none" chahiye
    // local me dono localhost hain, wahan "lax" chalta hai
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth"
};

const refreshCookieOptions = {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const isNonEmptyString = (value) =>
    typeof value === "string" && value.trim().length > 0;


// REGISTER
const register = async (req, res, next) => {
    try {
        const { name, email, password, employeeId, department } = req.body;

        // typeof check zaroori hai, warna koi { "$ne": null } bhej ke query bigad sakta hai
        if (
            !isNonEmptyString(name) ||
            !isNonEmptyString(email) ||
            !isNonEmptyString(password) ||
            !isNonEmptyString(employeeId) ||
            !isNonEmptyString(department)
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanEmployeeId = employeeId.trim();

        const existingUser = await User.findOne({
            $or: [{ email: cleanEmail }, { employeeId: cleanEmployeeId }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email or employee ID already registered"
            });
        }

        const hashedPassword = await argon2.hash(password);

        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword,
            employeeId: cleanEmployeeId,
            department: department.trim(),
            role: "teacher"
        });

        return res.status(201).json({
            success: true,
            message: "Teacher Registered Successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                employeeId: user.employeeId,
                department: user.department,
                role: user.role
            }
        });

    } catch (error) {
        // do log ek saath register karein to findOne dono ko miss kar deta hai,
        // tab unique index error deta hai (code 11000)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or employee ID already registered"
            });
        }
        next(error);
    }
};


// LOGIN
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User
            .findOne({ email: email.trim().toLowerCase() })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordValid = await argon2.verify(user.password, password);

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // isActive check password ke baad, warna bina password jaane
        // koi bhi pata laga sakta hai ki kaun sa account inactive hai
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        const { accessToken, refreshToken } = await generateTokens(user);

        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                employeeId: user.employeeId,
                department: user.department,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};


// LOGOUT
const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await RefreshToken.deleteOne({
                tokenHash: hashToken(refreshToken)
            });
        }

        // clearCookie me maxAge nahi dete, baaki options same hone chahiye
        res.clearCookie("refreshToken", cookieBase);

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        next(error);
    }
};


// REFRESH ACCESS TOKEN
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
        }

        // Pehle purana token atomically delete karte hain (find + delete ek hi step me).
        // Isse agar 2 requests ek saath aayein to sirf ek jeetegi, aur
        // naya token bana ke baad me cleanup karne ki zaroorat nahi padti.
        const storedToken = await RefreshToken.findOneAndDelete({
            tokenHash: hashToken(refreshToken)
        });

        // yahan cookie clear nahi kar rahe: agar ye parallel request ki haar hai,
        // to jeetne wali request ki nayi cookie yahan se mit sakti hai
        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid or already used refresh token"
            });
        }

        if (storedToken.expiresAt <= new Date()) {
            return res.status(401).json({
                success: false,
                message: "Refresh token expired"
            });
        }

        const user = await User.findById(storedToken.user);

        if (!user || !user.isActive) {
            res.clearCookie("refreshToken", cookieBase);

            return res.status(401).json({
                success: false,
                message: "User is not available"
            });
        }

        const tokens = await generateTokens(user);

        res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: tokens.accessToken
        });

    } catch (error) {
        return next(error);
    }
};


module.exports = {
    register,
    login,
    logout,
    refresh
};