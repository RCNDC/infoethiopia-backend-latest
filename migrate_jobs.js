const { Sequelize } = require('sequelize');
const config = require("./config/config.js").development;

async function migrate() {
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: 'mysql',
        logging: false
    });
    try {
        console.log('Adding columns to Job Post...');
        await sequelize.query('ALTER TABLE `Job Post` ADD COLUMN IF NOT EXISTS approved TINYINT(1) DEFAULT 0');
        await sequelize.query('ALTER TABLE `Job Post` ADD COLUMN IF NOT EXISTS companyId CHAR(36)');
        await sequelize.query('ALTER TABLE `Job Post` ADD COLUMN IF NOT EXISTS licence VARCHAR(255)');

        console.log('Adding columns to Approved Job...');
        await sequelize.query('ALTER TABLE `Approved Job` ADD COLUMN IF NOT EXISTS companyId CHAR(36)');
        await sequelize.query('ALTER TABLE `Approved Job` ADD COLUMN IF NOT EXISTS licence VARCHAR(255)');

        console.log('Migration completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit();
    }
}
migrate();
