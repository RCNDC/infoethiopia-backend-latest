const { Sequelize } = require('sequelize');
const config = require("./config/config.js").development;
const bcrypt = require('bcrypt');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log
});

async function checkStaffLogin() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connection established.\n');

        // Check if staff table exists and has data
        const [staff] = await sequelize.query("SELECT username, password, role FROM staff;");
        console.log('Staff in database:', staff.length);

        if (staff.length > 0) {
            console.log('\nStaff usernames:');
            staff.forEach(s => {
                console.log(`  - ${s.username} (role: ${s.role})`);
            });

            // Test password comparison for the user trying to log in
            const testUsername = 'eyobadoe';
            const testUser = staff.find(s => s.username === testUsername);

            if (testUser) {
                console.log(`\n✓ Found user: ${testUsername}`);
                console.log(`  Password hash: ${testUser.password.substring(0, 20)}...`);

                // Try a test password comparison
                console.log('\nTesting password comparison...');
                const testPassword = 'test123'; // Replace with actual password if known
                try {
                    const isValid = await bcrypt.compare(testPassword, testUser.password);
                    console.log(`  Password "${testPassword}" is ${isValid ? 'VALID' : 'INVALID'}`);
                } catch (err) {
                    console.log(`  Error comparing password: ${err.message}`);
                }
            } else {
                console.log(`\n✗ User "${testUsername}" NOT FOUND in database`);
            }
        } else {
            console.log('✗ No staff records found in database!');
        }
    } catch (error) {
        console.error('✗ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkStaffLogin();
