
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const RefreshToken = require("../models/RefreshToken");
const hashToken = require("./hashTokens");

const generateTokens = async (user) => {
    // 1. Check whether JWT secret is configured
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is not configured");
    }

    // 2. Generate access token
    const accessToken = jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m"
        }
    );

    // 3. Generate a cryptographically secure refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // 4. Hash the refresh token before storing it
    const refreshTokenHash = hashToken(refreshToken);

    // 5. Set refresh token expiry to 7 days
    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // 6. Store only the hash in the database
    await RefreshToken.create({
        user: user._id,
        tokenHash: refreshTokenHash,
        expiresAt
    });

    // 7. Return tokens to the controller
    return {
        accessToken,
        refreshToken
    };
};

module.exports = generateTokens;
