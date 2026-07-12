const User = require('../models/User');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        // Exclude Admin — admin is a virtual entity that doesn't live in the DB
        const users = await User.find({ role: { $ne: 'Admin' } }).select('-password').populate('department', 'name');
        
        // Map to exact required format: { _id, name, email, department, role, isActive }
        const employees = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            department: user.department,
            role: user.role,
            isActive: user.status === 'Active'
        }));
        
        res.status(200).json({ success: true, employees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user role and department
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { role, department } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Admin can promote/demote to valid roles
        if (role) {
            const validRoles = ['Admin', 'Asset Manager', 'Department Head', 'Employee', 'None'];
            if (validRoles.includes(role)) {
                user.role = role === 'None' ? 'Employee' : role; // Map None back to standard employee
            }
        }
        
        if (department !== undefined) {
            user.department = department === 'None' || department === '' ? null : department;
        }

        await user.save();
        res.status(200).json({ success: true, message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getUsers, updateUser };