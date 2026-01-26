const { Sequelize } = require('sequelize');

// Test remote database connection
const remoteConfig = {
    username: "infoethiopianet_companyPortaluser",
    password: "2WrDgQcw2mF2",
    database: "infoethiopianet_companyPortal",
    host: "192.250.239.85",
    dialect: "mysql"
};

const sequelize = new Sequelize(remoteConfig.database, remoteConfig.username, remoteConfig.password, {
    host: remoteConfig.host,
    dialect: remoteConfig.dialect,
    logging: false,
    dialectOptions: {
        connectTimeout: 10000 // 10 second timeout
    }
});

async function testRemoteConnection() {
    console.log('Testing remote database connection...\n');
    console.log(`Host: ${remoteConfig.host}`);
    console.log(`Database: ${remoteConfig.database}\n`);

    try {
        await sequelize.authenticate();
        console.log('✓ Remote database is ACCESSIBLE!\n');

        // Check staff count
        const [staff] = await sequelize.query("SELECT COUNT(*) as count FROM Staffs;");
        console.log(`Staff count: ${staff[0].count}`);

        const [users] = await sequelize.query("SELECT username FROM Staffs LIMIT 5;");
        console.log('\nStaff usernames:');
        users.forEach(u => console.log(`  - ${u.username}`));

        console.log('\n✓ RECOMMENDATION: Switch back to remote database');

    } catch (error) {
        console.error('✗ Remote database is NOT ACCESSIBLE');
        console.error(`Error: ${error.message}\n`);
        console.log('RECOMMENDATION: Copy staff records to local database');
    } finally {
        await sequelize.close();
    }
}

testRemoteConnection();
