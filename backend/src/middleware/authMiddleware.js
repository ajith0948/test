const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - checks if user is logged in
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Virtual Admin: no DB record exists — inject a synthetic user object
            if (decoded.userId === 'virtual_admin') {
                req.user = {
                    _id: 'virtual_admin',
                    name: 'System Admin',
                    email: '',
                    role: 'Admin',
                    department: null
                };
                return next();
            }

            // Fetch exactly the required fields
            req.user = await User.findById(decoded.userId).select('_id role department');
            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role authorization - checks if user has specific roles (e.g., Admin)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };