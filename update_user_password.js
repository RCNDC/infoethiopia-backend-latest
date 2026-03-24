const db = require('./models');
const bcrypt = require('bcrypt');

async function updateUserPassword() {
    try {
        // Find the user by email
        const user = await db.User.findOne({
            where: { email: 'test@example.com' }
        });

        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        console.log('Found user:', {
            Id: user.Id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            activate: user.activate
        });

        // Hash the new password
        const newPassword = 'pass';
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        console.log('New hashed password:', hashedPassword);

        // Update the user's password
        await user.update({ password: hashedPassword });

        console.log('Password updated successfully!');
        console.log('You can now login with email: test@example.com and password: pass');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateUserPassword();
