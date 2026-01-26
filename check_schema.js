const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

async function check() {
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: 'mysql',
        logging: false
    });
    try {
        const [newsCols] = await sequelize.query('SHOW COLUMNS FROM `News`');
        console.log('News columns:', newsCols.map(c => ({ Field: c.Field, Type: c.Type })));

        const [jobPostCols] = await sequelize.query('SHOW COLUMNS FROM `Job Post`');
        console.log('Job Post columns:', jobPostCols.map(c => ({ Field: c.Field, Type: c.Type })));

        const [approvedJobCols] = await sequelize.query('SHOW COLUMNS FROM `Approved Job`');
        console.log('Approved Job columns:', approvedJobCols.map(c => ({ Field: c.Field, Type: c.Type })));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
