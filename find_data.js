const { Sequelize } = require('sequelize');
const config = require("./config/config.js").development;

const sequelize = new Sequelize('', config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function findData() {
    try {
        await sequelize.authenticate();
        const [dbs] = await sequelize.query("SHOW DATABASES;");
        for (const dbRow of dbs) {
            const dbName = dbRow.Database;
            if (['information_schema', 'mysql', 'performance_schema', 'sys'].includes(dbName)) continue;

            console.log(`Checking database: ${dbName}`);
            try {
                const dbConn = new Sequelize(dbName, config.username, config.password, {
                    host: config.host,
                    dialect: config.dialect,
                    logging: false
                });

                const [tables] = await dbConn.query("SHOW TABLES;");
                for (const tableRow of tables) {
                    const tableName = Object.values(tableRow)[0];
                    if (tableName.toLowerCase() === 'company' || tableName.toLowerCase() === 'companies') {
                        const [count] = await dbConn.query(`SELECT COUNT(*) as count FROM ${tableName};`);
                        console.log(`  - Table ${tableName} has ${count[0].count} records.`);
                    }
                }
                await dbConn.close();
            } catch (e) {
                console.log(`  - Could not check ${dbName}: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

findData();
