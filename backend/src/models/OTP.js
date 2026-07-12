const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }, // Not hashed yet, User model will hash it upon actual creation
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-deletes after 10 minutes (600 seconds)
});

module.exports = mongoose.model('OTP', otpSchema);