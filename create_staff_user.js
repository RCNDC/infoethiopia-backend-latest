const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;
const bcrypt = require('bcrypt');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function createStaffUser() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database\n');

        // Create the eyobadoe user
        const username = 'eyobadoe';
        const password = 'password123'; // Default password - user should change this
        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await sequelize.query(`
            INSERT INTO staff (Id, firstName, middleName, lastName, phone, email, city, wereda, subCity, username, password, role, createdAt, updatedAt)
            VALUES (UUID(), 'Eyob', 'A', 'Doe', '0911234567', 'eyob@example.com', 'Addis Ababa', 'Wereda 1', 'Bole', '${username}', '${hashedPassword}', 1, NOW(), NOW())
        `);

        console.log(`✓ Created staff user: ${username}`);
        console.log(`  Default password: ${password}`);
        console.log(`\n⚠️  IMPORTANT: User should change this password after first login!\n`);

    } catch (error) {
        console.error('✗ Error:', error.message);
        if (error.message.includes('Duplicate')) {
            console.log('\n  User already exists. Checking existing users...\n');
            const [users] = await sequelize.query('SELECT username, role FROM staff');
            users.forEach(u => console.log(`  - ${u.username} (role: ${u.role})`));
        }
    } finally {
        await sequelize.close();
    }
}

createStaffUser();
