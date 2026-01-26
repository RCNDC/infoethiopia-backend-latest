const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        // Check news count
        const [news] = await sequelize.query("SELECT COUNT(*) as count FROM news;");
        console.log('News count:', news[0].count);

        // Check company count
        const [company] = await sequelize.query("SELECT COUNT(*) as count FROM company;");
        console.log('Company count:', company[0].count);

        // Check catagory count
        const [catagory] = await sequelize.query("SELECT COUNT(*) as count FROM catagory;");
        console.log('Catagory count:', catagory[0].count);

        // Check staff count
        const [staff] = await sequelize.query("SELECT COUNT(*) as count FROM staff;");
        console.log('Staff count:', staff[0].count);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

check();
