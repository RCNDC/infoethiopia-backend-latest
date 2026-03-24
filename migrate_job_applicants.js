const { Sequelize } = require("sequelize");
const config = require("./config/config.js")[process.env.NODE_ENV || "development"];

const createTableQuery = `
CREATE TABLE IF NOT EXISTS \`Job Applicants\` (
  \`Id\` CHAR(36) NOT NULL,
  \`fullName\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`phone\` VARCHAR(30) DEFAULT NULL,
  \`cvLink\` VARCHAR(1000) DEFAULT NULL,
  \`cvFileId\` VARCHAR(255) DEFAULT NULL,
  \`cvMessageId\` VARCHAR(255) DEFAULT NULL,
  \`jobPostId\` VARCHAR(255) NOT NULL,
  \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (\`Id\`),
  KEY \`idx_job_applicants_job_post\` (\`jobPostId\`),
  UNIQUE KEY \`uniq_job_applicant_per_job\` (\`jobPostId\`, \`email\`),
  CONSTRAINT \`fk_job_applicants_job_post\`
    FOREIGN KEY (\`jobPostId\`) REFERENCES \`Job Post\` (\`Id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_520_ci;
`;

async function migrate() {
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: "mysql",
        logging: false,
    });

    try {
        await sequelize.authenticate();
        console.log("Connected. Creating `Job Applicants` table...");
        await sequelize.query(createTableQuery);
        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

migrate();
