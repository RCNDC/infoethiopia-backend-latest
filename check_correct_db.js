const { Sequelize } = require('sequelize');
const config = require("./config/config.js").development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function check() {
    try {
        await sequelize.authenticate();
        console.log(`Connection established to ${config.database}.`);

        // Check data presence with pluralized/actual names
        const tablesToCheck = ['Companies', 'News', 'Job Post', 'Catagories', 'Staffs', 'Companies News'];
        for (const table of tablesToCheck) {
            try {
                const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`);
                console.log(`Table ${table} count:`, count[0].count);
            } catch (e) {
                console.log(`Table ${table} check failed:`, e.message);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

check();
