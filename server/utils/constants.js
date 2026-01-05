// Application constants

const TOPICS = ["DSA", "Java", "JavaScript", "SQL", "HR"];

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];

const USER_ROLES = {
    USER: "user",
    ADMIN: "admin",
};

const TEST_TYPES = {
    TOPIC_BASED: "topic-based",
    DIFFICULTY_BASED: "difficulty-based",
    MIXED: "mixed",
};

const DEFAULT_TEST_CONFIG = {
    DURATION: 30, // minutes
    QUESTION_COUNT: 10,
};

const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};

module.exports = {
    TOPICS,
    DIFFICULTY_LEVELS,
    USER_ROLES,
    TEST_TYPES,
    DEFAULT_TEST_CONFIG,
    PAGINATION,
};
