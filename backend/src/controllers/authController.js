const User = require('../models/User');
const OTP = require('../models/OTP'); // Bring in the new OTP model
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body; // No more adminSecret!

        if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });
        if (!passwordRegex.test(password)) return res.status(400).json({ message: 'Password must be at least 8 characters, include a number and a special character.' });

        const userExists = await User.findOne({ $or: [{ email }, { name }] });
        if (userExists) return res.status(400).json({ message: 'Email or Username already taken' });

        await OTP.deleteMany({ email });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');

        // STRICTLY FORCE 'Employee' ROLE
        await OTP.create({
            name,
            email,
            password,
            role: 'Employee', // Cannot be bypassed
            otp: hashedOtp
        });

        const message = `<h2>Welcome to AssetFlow</h2><p>Your verification code is: <b style="font-size: 24px;">${otpCode}</b></p><p>This code expires in 10 minutes.</p>`;

        console.log(`\n🚀 [HACKATHON BYPASS] OTP for ${email} is: ${otpCode}\n`);

        try {
            await sendEmail({ email, subject: 'AssetFlow - Verify Your Account', html: message });
            res.status(201).json({ message: 'Code sent! Please check your email for the OTP.' });
        } catch (err) {
            console.error('Email send failed with error:', err);
            require('fs').appendFileSync('email_error.log', new Date().toISOString() + ' ' + err.toString() + '\n');
            res.status(201).json({ message: 'Email failed to send, but check your backend terminal for the OTP!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Find the temporary record
        const pendingUser = await OTP.findOne({ email, otp: hashedOtp });
        if (!pendingUser) return res.status(400).json({ message: 'Invalid or expired OTP' });

        // SUCCESS! CREATE THE REAL USER NOW
        const newUser = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            isEmailVerified: true // Set to true immediately
        });

        // Delete the temporary record so it can't be used again
        await OTP.deleteOne({ _id: pendingUser._id });

        res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { adminPass } = req.body;
        
        if (adminPass !== process.env.ADMIN_SECRET) {
            return res.status(401).json({ message: 'Invalid Admin Secret' });
        }

        // Admin is VIRTUAL - no database record is created or looked up.
        // We mint a token with a special reserved userId so the middleware can identify it.
        const token = jwt.sign(
            { userId: 'virtual_admin', role: 'Admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Also set cookie for cookie-based checks (same policy as generateToken.js)
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            _id: 'virtual_admin',
            name: 'System Admin',
            email: '',
            role: 'Admin',
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user is set in authMiddleware, just return it
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.logout = (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// ... keep forgotPassword and resetPassword exactly the same as before
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'No account with that email found' });

        const resetToken = user.getSignedToken('reset');
        await user.save();

        // FRONTEND_URL may be a comma-separated list (see app.js CORS config) -
        // use the first entry as the canonical link target.
        const frontendOrigin = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();
        const resetUrl = `${frontendOrigin}/reset-password/${resetToken}`;
        const message = `<p>You requested a password reset. Click the link to reset it:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 15 minutes.</p>`;

        console.log(`\n🔑 [HACKATHON BYPASS] Password Reset Link: ${resetUrl}\n`);

        try {
            await sendEmail({ email: user.email, subject: 'Password Reset Request', html: message });
            res.status(200).json({ message: 'Password reset link sent to email or terminal.' });
        } catch (err) {
            res.status(200).json({ message: 'Email failed to send, but check your backend terminal for the reset link!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
        if (!passwordRegex.test(req.body.password)) return res.status(400).json({ message: 'Password does not meet strength requirements' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};