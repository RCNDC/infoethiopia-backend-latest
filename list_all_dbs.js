const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

const sequelize = new Sequelize('', config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function listDbs() {
    try {
        await sequelize.authenticate();
        const [dbs] = await sequelize.query("SHOW DATABASES;");
        console.log('Available Databases:', dbs.map(db => db.Database));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

listDbs();
