const express = require('express');
const { getUsers, updateUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Only Admins can view all users and update their roles
router.get('/', protect, authorizeRoles('Admin'), getUsers);
router.put('/:id', protect, authorizeRoles('Admin'), updateUser);

module.exports = router;