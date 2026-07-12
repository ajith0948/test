const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const TransferRequest = require('../models/TransferRequest');
const AssetCategory = require('../models/AssetCategory');
const generateAssetTag = require('../utils/generateAssetTag');
const { logActivity } = require('../utils/logActivity');

const getAttachmentType = (file) => {
    if (file.mimetype?.startsWith('image/')) {
        return 'image';
    }

    const extension = (file.format || file.originalname?.split('.').pop() || '').toLowerCase();
    return ['pdf', 'doc', 'docx'].includes(extension) ? extension : null;
};

// Coerces a raw value to match a category custom field's declared valueType.
const coerceCustomFieldValue = (valueType, rawValue) => {
    if (valueType === 'int') {
        const num = Number(rawValue);
        return Number.isNaN(num) ? undefined : num;
    }
    if (valueType === 'flag') {
        return rawValue === true || rawValue === 'true' || rawValue === 'on' || rawValue === 1 || rawValue === '1';
    }
    return String(rawValue); // 'string'
};

// The asset registration form is submitted as multipart/form-data (because of
// file attachments), so `customFields` arrives as a JSON string rather than
// an object. This parses it and, when a category is known, drops unknown
// keys and coerces each value to the type declared on that category
// (string/int/flag) so we don't end up storing "42" instead of 42, etc.
const parseCustomFields = async (rawCustomFields, categoryId) => {
    if (!rawCustomFields) return {};

    let parsed;
    try {
        parsed = typeof rawCustomFields === 'string' ? JSON.parse(rawCustomFields) : rawCustomFields;
    } catch {
        throw new Error('customFields must be valid JSON.');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('customFields must be an object of field name to value.');
    }

    if (!categoryId) return parsed;

    const category = await AssetCategory.findById(categoryId).select('customFields');
    if (!category || !category.customFields.length) return {};

    const result = {};
    for (const field of category.customFields) {
        if (Object.prototype.hasOwnProperty.call(parsed, field.key)) {
            const coerced = coerceCustomFieldValue(field.valueType, parsed[field.key]);
            if (coerced !== undefined && coerced !== '') result[field.key] = coerced;
        }
    }
    return result;
};

// @desc    Register a new asset (with optional attachments)
// @route   POST /api/assets
// @access  Private (Admin & Asset Manager)
const createAsset = async (req, res) => {
    try {
        const assetTag = await generateAssetTag();

        const attachments = (req.files || []).map((file) => ({
            fileName: file.originalname,
            fileUrl: file.path,
            fileType: getAttachmentType(file),
            fileSize: file.size,
        }));

        if (attachments.some(({ fileType }) => !fileType)) {
            return res.status(400).json({
                success: false,
                message: 'Attachments must be images, PDFs, DOC, or DOCX files.',
            });
        }

        const {
            name,
            category,
            serialNumber,
            acquisitionDate,
            acquisitionCost,
            condition,
            location,
            department,
            isShared,
            customFields,
        } = req.body;

        const resolvedCustomFields = await parseCustomFields(customFields, category);

        const asset = await Asset.create({
            assetTag,
            name,
            category,
            serialNumber,
            acquisitionDate,
            acquisitionCost,
            condition,
            location,
            department: department || null,
            isShared,
            customFields: resolvedCustomFields,
            attachments,
        });

        await logActivity({
            user: req.user._id,
            action: `Registered asset ${asset.assetTag} (${asset.name})`,
            module: 'Asset',
            metadata: { assetId: asset._id, assetTag: asset.assetTag },
        });

        res.status(201).json({
            success: true,
            message: 'Asset registered successfully.',
            asset,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get assets (search, filter, paginate)
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res) => {
    try {
        const { search, category, status, department, location, page = 1, limit = 20 } = req.query;
        const query = { isActive: true };

        if (search) {
            const expression = new RegExp(search, 'i');
            query.$or = [{ assetTag: expression }, { serialNumber: expression }, { name: expression }];
        }
        if (category) query.category = category;
        if (status) query.status = status;
        if (department) query.department = department;
        if (location) query.location = new RegExp(location, 'i');

        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const [assets, total] = await Promise.all([
            Asset.find(query)
                .populate('category', 'name')
                .populate('department', 'name')
                .sort({ createdAt: -1 })
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit),
            Asset.countDocuments(query),
        ]);

        res.json({ success: true, assets, pagination: { page: safePage, limit: safeLimit, total } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single asset with its allocation/transfer history
// @route   GET /api/assets/:assetId
// @access  Private
const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.assetId)
            .populate('category', 'name')
            .populate('department', 'name');
        if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });

        const [allocations, transfers] = await Promise.all([
            Allocation.find({ asset: asset._id }).sort({ createdAt: -1 }),
            TransferRequest.find({ asset: asset._id }).sort({ createdAt: -1 }),
        ]);
        res.json({ success: true, asset, history: { allocations, transfers } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an asset (with optional new attachments)
// @route   PATCH /api/assets/:assetId
// @access  Private (Admin & Asset Manager)
const updateAsset = async (req, res) => {
    try {
        const allowedFields = [
            'name', 'category', 'serialNumber', 'acquisitionDate', 'acquisitionCost',
            'condition', 'location', 'department', 'isShared', 'customFields', 'status', 'isActive',
        ];
        const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        if ('customFields' in updates) {
            const categoryForCoercion = updates.category || (await Asset.findById(req.params.assetId).select('category'))?.category;
            updates.customFields = await parseCustomFields(updates.customFields, categoryForCoercion);
        }

        if (req.files?.length) {
            const newAttachments = req.files.map((file) => ({
                fileName: file.originalname,
                fileUrl: file.path,
                fileType: getAttachmentType(file),
                fileSize: file.size,
            }));
            if (newAttachments.some(({ fileType }) => !fileType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Attachments must be images, PDFs, DOC, or DOCX files.',
                });
            }
            const existing = await Asset.findById(req.params.assetId).select('attachments');
            updates.attachments = [...(existing?.attachments || []), ...newAttachments].slice(0, 3);
        }

        const asset = await Asset.findByIdAndUpdate(req.params.assetId, updates, { new: true, runValidators: true });
        if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });
        res.json({ success: true, asset });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { createAsset, getAssets, getAssetById, updateAsset };
