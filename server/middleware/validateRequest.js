const { body, param, query, validationResult } = require("express-validator");

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        return res.status(400).json({
            message: `Validation failed: ${errorMessages.join(", ")}`,
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

// Validation rules for user registration
const validateRegister = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/\d/)
        .withMessage("Password must contain at least one number")
        .matches(/[\W_]/)
        .withMessage("Password must contain at least one special character"),
    validate,
];

// Validation rules for user login
const validateLogin = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
];

// Validation rules for adding/updating questions
const validateQuestion = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Question title is required")
        .isLength({ min: 10, max: 500 })
        .withMessage("Question title must be between 10 and 500 characters"),
    body("options")
        .isArray({ min: 2, max: 6 })
        .withMessage("Must provide between 2 and 6 options"),
    body("options.*")
        .trim()
        .notEmpty()
        .withMessage("Option cannot be empty"),
    body("correctAnswer")
        .trim()
        .notEmpty()
        .withMessage("Correct answer is required"),
    body("topic")
        .trim()
        .notEmpty()
        .withMessage("Topic is required")
        .isIn(["DSA", "Java", "JavaScript", "SQL", "HR"])
        .withMessage("Invalid topic"),
    body("difficulty")
        .trim()
        .notEmpty()
        .withMessage("Difficulty is required")
        .isIn(["Easy", "Medium", "Hard"])
        .withMessage("Invalid difficulty level"),
    body("explanation")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Explanation must not exceed 1000 characters"),
    validate,
];

// Validation for MongoDB ObjectId
const validateObjectId = (paramName = "id") => [
    param(paramName)
        .isMongoId()
        .withMessage("Invalid ID format"),
    validate,
];

// Validation for test creation
const validateTestCreation = [
    body("topic")
        .optional()
        .isIn(["DSA", "Java", "JavaScript", "SQL", "HR", "All"])
        .withMessage("Invalid topic"),
    body("difficulty")
        .optional()
        .isIn(["Easy", "Medium", "Hard", "All"])
        .withMessage("Invalid difficulty"),
    body("duration")
        .optional()
        .isInt({ min: 5, max: 180 })
        .withMessage("Duration must be between 5 and 180 minutes"),
    body("questionCount")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Question count must be between 1 and 50"),
    validate,
];

// Validation for test submission
const validateTestSubmission = [
    body("answers")
        .isArray()
        .withMessage("Answers must be an array"),
    body("timeTaken")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Time taken must be a positive number"),
    validate,
];

module.exports = {
    validate,
    validateRegister,
    validateLogin,
    validateQuestion,
    validateObjectId,
    validateTestCreation,
    validateTestSubmission,
};
