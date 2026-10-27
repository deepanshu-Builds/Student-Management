
const errorMiddleware = (err, req, res, next) => {
    // Log detailed error on the server
    console.error(err);

    // Use provided status code, or default to 500
    let statusCode = err.statusCode || err.status || 500;

    // Avoid sending invalid HTTP status codes
    if (
        !Number.isInteger(statusCode) ||
        statusCode < 400 ||
        statusCode > 599
    ) {
        statusCode = 500;
    }

    let message = err.message || "Internal Server Error";

    // Handle invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // Handle duplicate MongoDB fields
    if (err.code === 11000) {
        statusCode = 409;
        message = "A record with this value already exists";
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
    }

    // Hide internal server errors from clients
    if (statusCode === 500) {
        message = "Internal Server Error";
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorMiddleware;
