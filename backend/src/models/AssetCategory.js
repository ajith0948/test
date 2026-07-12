
const mongoose = require('mongoose');

// valueType drives both the input rendered on the asset registration form and
// how the value gets coerced before being saved into Asset.customFields:
//   'string' -> free text, 'int' -> number, 'flag' -> boolean checkbox
const customFieldSchema = new mongoose.Schema({
    key: { type: String, required: true, trim: true },
    valueType: { type: String, enum: ['string', 'int', 'flag'], required: true }
}, { _id: false }); // _id is false to keep the array clean without generating unnecessary IDs for each field

const assetCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    customFields: [customFieldSchema]
}, { timestamps: true });

module.exports = mongoose.model('AssetCategory', assetCategorySchema);