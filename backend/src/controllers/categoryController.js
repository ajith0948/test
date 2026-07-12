
const AssetCategory = require('../models/AssetCategory');

// @desc    Create a new asset category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, customFields } = req.body;

        const categoryExists = await AssetCategory.findOne({ name });
        if (categoryExists) return res.status(400).json({ message: 'Category already exists' });

        const category = await AssetCategory.create({
            name,
            customFields: customFields || []
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all asset categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categoriesData = await AssetCategory.find();
        
        const categories = categoriesData.map(cat => ({
            _id: cat._id,
            name: cat.name,
            description: cat.description,
            customFields: cat.customFields,
            isActive: cat.isActive
        }));

        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        const { name, customFields } = req.body;

        const category = await AssetCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        category.name = name || category.name;
        category.customFields = customFields || category.customFields;

        const updatedCategory = await category.save();
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCategory, getCategories, updateCategory };