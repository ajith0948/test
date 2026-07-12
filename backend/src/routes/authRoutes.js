const express = require('express');
const { signup, login, adminLogin, logout, forgotPassword, resetPassword, verifyEmail, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail); // Changed to POST to accept OTP
router.post('/login', login); // Rate limiter removed
router.post('/admin-login', adminLogin);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;