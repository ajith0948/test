const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '1h', // 1-hour expiry as requested
    });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProd, // requires HTTPS - only true in production (Render)
        // 'none' is required for the cross-site cookie to be accepted when the
        // frontend and backend are on different Render subdomains; 'lax' is
        // fine for same-origin local dev. 'none' without 'secure' is rejected
        // by browsers, hence gating both on isProd together.
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    });
    
    return token;
};

module.exports = generateToken;