require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || "infoethiopianet_companyPortaluser",
        password: process.env.DB_PASS || "2WrDgQcw2mF2",
        database: process.env.DB_NAME || "infoethiopianet_companyPortal",
        host: process.env.DB_HOST || "192.250.239.85",
        dialect: "mysql"
    },
    test: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASS || null,
        database: process.env.DB_NAME || "database_test",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql"
    },
    production: {
        username: process.env.DB_USER || "infoethiopianet_companyPortaluser",
        password: process.env.DB_PASS || "2WrDgQcw2mF2",
        database: process.env.DB_NAME || "infoethiopianet_companyPortal",
        host: process.env.DB_HOST || "192.250.239.85",
        dialect: "mysql"
    }
};
