
const Student = require("../models/Student");

const getOwnershipFilter = (user) => {
    if (user.role === "admin") {
        return {};
    }

    return { createdBy: user.userId };
};

const getAllStudents = async (req, res, next) => {
    try {
        // 1. Read query parameters
        const {
            search,
            department,
            year,
            page = "1",
            limit = "10",
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        // 2. Validate pagination
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be >= 1 and limit must be between 1 and 100"
            });
        }

        // 3. Validate sorting fields
        const allowedSortFields = [
            "name",
            "rollNumber",
            "department",
            "year",
            "createdAt"
        ];

        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sortBy field"
            });
        }

        if (!["asc", "desc"].includes(order)) {
            return res.status(400).json({
                success: false,
                message: "Order must be asc or desc"
            });
        }

        // 4. Build the database filter
        const filter = {
            ...getOwnershipFilter(req.user),
            isActive: true
        };

        // 5. Search by name or roll number
        if (search && search.trim()) {
            const searchTerm = search.trim().slice(0, 100);
            const escapedSearch = searchTerm.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                { name: { $regex: escapedSearch, $options: "i" } },
                { rollNumber: { $regex: escapedSearch, $options: "i" } }
            ];
        }

        // 6. Filter by department
        if (department && department.trim()) {
            filter.department = department.trim();
        }

        // 7. Filter by year
        if (year !== undefined) {
            const yearNumber = Number(year);

            if (
                !Number.isInteger(yearNumber) ||
                yearNumber < 1 ||
                yearNumber > 4
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Year must be between 1 and 4"
                });
            }

            filter.year = yearNumber;
        }

        // 8. Calculate pagination
        const skip = (pageNumber - 1) * limitNumber;

        // 9. Run query and count in parallel
        const [students, totalStudents] = await Promise.all([
            Student.find(filter)
                .sort({
                    [sortBy]: order === "asc" ? 1 : -1,
                    _id: 1
                })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            Student.countDocuments(filter)
        ]);

        // 10. Return paginated response
        return res.status(200).json({
            success: true,
            pagination: {
                totalStudents,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalStudents / limitNumber),
                pageSize: limitNumber,
                hasNextPage: pageNumber * limitNumber < totalStudents,
                hasPreviousPage: pageNumber > 1
            },
            students
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentByRollNumber,
    updateStudent,
    deleteStudent
};
