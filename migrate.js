const db = require("./models");

async function migrate() {
    try {
        console.log("Starting final migration fixes...");

        // Check columns
        const [results] = await db.sequelize.query("DESCRIBE Staffs");
        const roleIdExists = results.some(col => col.Field === 'roleId');
        const oldRoleExists = results.some(col => col.Field === 'role');

        if (!roleIdExists) {
            console.log("Adding roleId column to Staffs...");
            await db.sequelize.query("ALTER TABLE Staffs ADD COLUMN roleId INT(11) NULL AFTER password");
            console.log("Successfully added roleId column.");
        }

        if (oldRoleExists) {
            console.log("Making old 'role' column nullable...");
            await db.sequelize.query("ALTER TABLE Staffs MODIFY COLUMN role INT(11) NULL");

            // Optional: Drop the old 'role' column if you're sure it's no longer needed
            // console.log("Dropping old 'role' column...");
            // await db.sequelize.query("ALTER TABLE Staffs DROP COLUMN role");

            console.log("Old 'role' column is now nullable (unblocking creation).");
        }

        // Migrate existing role data
        console.log("Migrating existing staff role data...");
        await db.sequelize.query("UPDATE Staffs SET roleId = role WHERE roleId IS NULL AND role IS NOT NULL");
        console.log("Data migration complete.");

        console.log("Migration finished.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:");
        console.error(err);
        process.exit(1);
    }
}

migrate();
