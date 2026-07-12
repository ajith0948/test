const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Unique Username enforced
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
        default: 'Employee'
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    phone: String,

    // Security Fields
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

// FIXED: Removed 'next' parameter. Mongoose handles async hooks natively now.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate token for email verification or password reset
userSchema.methods.getSignedToken = function (type) {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to database securely
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    if (type === 'reset') {
        this.resetPasswordToken = hashedToken;
        this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 Minutes
    } else if (type === 'verify') {
        this.emailVerificationToken = hashedToken;
    }

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);