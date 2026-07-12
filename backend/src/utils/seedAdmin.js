const User = require('../models/User');

const seedAdmin = async () => {
    try {
        // Check if ANY Admin exists in the system
        const adminExists = await User.findOne({ role: 'Admin' });

        if (!adminExists) {
            console.log('⚙️ No Admin found. Seeding default System Admin account...');
            await User.create({
                name: 'System Admin',
                email: 'admin@assetflow.com',
                password: 'AdminPassword123!', // This will be hashed automatically by your User model pre-save hook
                role: 'Admin',
                isEmailVerified: true // Skip OTP for the default admin
            });
            console.log('✅ Default Admin seeded successfully! (admin@assetflow.com / AdminPassword123!)');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};

module.exports = seedAdmin;