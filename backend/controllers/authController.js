
const argon2 = require("argon2");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const generateTokens = require("../utils/generateTokens");
const hashToken = require("../utils/hashTokens");

// REGISTER
const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            employeeId,
            department
        } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { employeeId }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email or employee ID already registered"
            });
        }

        const hashedPassword = await argon2.hash(password);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            employeeId,
            department,
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
        next(error);
    }
};


// LOGIN
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        const passwordValid = await argon2.verify(
            user.password,
            password
        );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const { accessToken, refreshToken } =
            await generateTokens(user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/api/auth"
        });

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

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            path: "/api/auth"
        });

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
    let newRefreshToken;

    try {
       
        
        const refreshToken = req.cookies?.refreshToken;

        console.log(
            "Refresh token received:",
            !!refreshToken
        );

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
        }

        // Hash the received refresh token
        const tokenHash = hashToken(refreshToken);

        // Find the token in database
        const storedToken = await RefreshToken.findOne({
            tokenHash
        });

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Check token expiry
        if (storedToken.expiresAt <= new Date()) {
            await RefreshToken.deleteOne({
                _id: storedToken._id
            });

            return res.status(401).json({
                success: false,
                message: "Refresh token expired"
            });
        }

        // Find associated user
        const user = await User.findById(storedToken.user);

        if (!user || !user.isActive) {
            await RefreshToken.deleteOne({
                _id: storedToken._id
            });

            return res.status(401).json({
                success: false,
                message: "User is not available"
            });
        }

        // Generate a new token pair
        const tokens = await generateTokens(user);

        const accessToken = tokens.accessToken;
        newRefreshToken = tokens.refreshToken;

        // Consume the old refresh token
        const consumedToken = await RefreshToken.findOneAndDelete({
            _id: storedToken._id,
            tokenHash,
            expiresAt: { $gt: new Date() }
        });

        if (!consumedToken) {
            await RefreshToken.deleteOne({
                tokenHash: hashToken(newRefreshToken)
            });

            return res.status(401).json({
                success: false,
                message: "Refresh token has already been used or expired"
            });
        }

        // Set the new refresh token cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/api/auth"
        });

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken
        });

    } catch (error) {
        // Clean up newly generated token if an error occurs
        if (newRefreshToken) {
            try {
                await RefreshToken.deleteOne({
                    tokenHash: hashToken(newRefreshToken)
                });
            } catch (cleanupError) {
                console.error(
                    "Refresh token cleanup failed:",
                    cleanupError.message
                );
            }
        }

        return next(error);
    }
};


module.exports = {
    register,
    login,
    logout,
    refresh
};
