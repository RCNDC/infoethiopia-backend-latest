const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function checkStaff() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');
        const [staff] = await sequelize.query("SELECT username, password, role FROM Staffs;");
        console.log('Staff list:', staff);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkStaff();
