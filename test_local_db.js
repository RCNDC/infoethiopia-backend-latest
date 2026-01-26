const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('companyportal', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

async function listDbs() {
    try {
        await sequelize.authenticate();
        const [tables] = await sequelize.query("SHOW TABLES;");
        console.log('Tables in companyportal:', tables.map(t => Object.values(t)[0]));
    } catch (error) {
        console.error('Local Connection Error:', error.message);

        // Try with likely username/password if root/empty fails
        console.log('Retrying with config credentials but localhost...');
        const config = require('./config/config.json').development;
        const sequelize2 = new Sequelize('', config.username, config.password, {
            host: 'localhost',
            dialect: 'mysql',
            logging: false
        });
        try {
            await sequelize2.authenticate();
            const [dbs] = await sequelize2.query("SHOW DATABASES;");
            console.log('Available Local Databases (with config credentials):', dbs.map(db => db.Database));
        } catch (error2) {
            console.error('Second attempt failed:', error2.message);
        } finally {
            await sequelize2.close();
        }
    } finally {
        await sequelize.close();
    }
}

listDbs();
