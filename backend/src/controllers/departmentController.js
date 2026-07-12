
const Department = require('../models/Department');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res) => {
    try {
        const { name, head, parentDepartment, status } = req.body;

        const deptExists = await Department.findOne({ name });
        if (deptExists) return res.status(400).json({ message: 'Department already exists' });

        const department = await Department.create({
            name,
            head: head || null,
            parentDepartment: parentDepartment || null,
            status: status || 'Active'
        });

        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Everyone can view depts)
const getDepartments = async (req, res) => {
    try {
        const departmentsData = await Department.find()
            .populate('head', 'name email')
            .populate('parentDepartment', 'name');

        const departments = departmentsData.map(dept => ({
            _id: dept._id,
            name: dept.name,
            departmentHead: dept.head, // Match contract
            isActive: dept.status === 'Active' // Match contract
        }));

        res.status(200).json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res) => {
    try {
        const { name, head, parentDepartment, status } = req.body;

        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        department.name = name || department.name;
        department.head = head !== undefined ? head : department.head;
        department.parentDepartment = parentDepartment !== undefined ? parentDepartment : department.parentDepartment;
        department.status = status || department.status;

        const updatedDepartment = await department.save();
        res.status(200).json(updatedDepartment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createDepartment, getDepartments, updateDepartment };