require("./loadEnv");

const buildDatabaseConfig = (fallbackDatabase) => ({
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || fallbackDatabase,
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql"
});

module.exports = {
    development: buildDatabaseConfig("database_development"),
    test: buildDatabaseConfig("database_test"),
    production: buildDatabaseConfig("database_production")
};
