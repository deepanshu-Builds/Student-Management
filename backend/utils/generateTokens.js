const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const RefreshToken = require("../models/RefreshToken");
const hashToken = require("./hashTokens");

const generateTokens = async (user) => {

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

    const refreshToken = crypto
        .randomBytes(64)
        .toString("hex");

    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await RefreshToken.create({
        user: user._id,
        tokenHash: refreshTokenHash,
        expiresAt
    });

    return {
        accessToken,
        refreshToken
    };
};

module.exports = generateTokens;