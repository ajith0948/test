const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '1h', // 1-hour expiry as requested
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // true in production
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    });
    
    return token;
};

module.exports = generateToken;