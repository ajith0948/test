const express = require('express');
const { createDepartment, getDepartments, updateDepartment } = require('../controllers/departmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Only Admins can Create or Update departments
router.post('/', protect, authorizeRoles('Admin'), createDepartment);
router.put('/:id', protect, authorizeRoles('Admin'), updateDepartment);

// Anyone logged in can view departments
router.get('/', protect, getDepartments);

module.exports = router;