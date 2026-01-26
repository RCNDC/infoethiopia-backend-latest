const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

// Try with original database name first
const sequelize = new Sequelize('infoethiopianet_companyPortal', config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function rawCheck() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW TABLES;");
        console.log('Tables in companyportal:', results.map(r => Object.values(r)[0]));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

rawCheck();
