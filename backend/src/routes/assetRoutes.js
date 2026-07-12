const express = require('express');
const { createAsset, getAssets, getAssetById, updateAsset } = require('../controllers/assetController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

// Only Admins and Asset Managers can register or edit assets
router.post('/', protect, authorizeRoles('Admin', 'Asset Manager'), upload.array('attachments', 3), createAsset);
router.patch('/:assetId', protect, authorizeRoles('Admin', 'Asset Manager'), upload.array('attachments', 3), updateAsset);

// Everyone logged in can view the asset list / detail
router.get('/', protect, getAssets);
router.get('/:assetId', protect, getAssetById);

module.exports = router;
