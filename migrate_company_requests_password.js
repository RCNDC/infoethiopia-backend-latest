const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("./config/config.js")[env];

if (!config) {
  console.error(`Invalid NODE_ENV "${env}". Expected one of: development, test, production.`);
  process.exit(1);
}

async function migrate() {
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: "mysql",
    logging: false,
  });

  try {
    console.log(`Running migration in "${env}" mode on DB "${config.database}" @ "${config.host}"`);
    console.log("Checking companyRequests.password column...");
    const [passwordColumn] = await sequelize.query(
      "SHOW COLUMNS FROM `companyRequests` LIKE 'password'"
    );

    if (!passwordColumn.length) {
      await sequelize.query(
        "ALTER TABLE `companyRequests` ADD COLUMN `password` VARCHAR(255) NULL AFTER `email`"
      );
      console.log("Added companyRequests.password column.");
    } else {
      console.log("companyRequests.password already exists.");
    }

    console.log("Backfilling missing companyRequests.password values from companyDashboard...");
    const [result] = await sequelize.query(`
      UPDATE \`companyRequests\` r
      INNER JOIN \`companyDashboard\` d ON d.email = r.email
      SET r.password = d.password
      WHERE r.password IS NULL OR r.password = ''
    `);

    const affected = typeof result.affectedRows === "number" ? result.affectedRows : 0;
    console.log(`Backfill completed. Updated rows: ${affected}`);
    console.log("Migration completed successfully.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

migrate();
