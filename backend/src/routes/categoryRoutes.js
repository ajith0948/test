const express = require('express');
const { createCategory, getCategories, updateCategory } = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Only Admins can Create or Update categories
router.post('/', protect, authorizeRoles('Admin'), createCategory);
router.put('/:id', protect, authorizeRoles('Admin'), updateCategory);

// Anyone logged in can view categories
router.get('/', protect, getCategories);

module.exports = router;