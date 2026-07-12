const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
    {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, enum: ['image', 'pdf', 'doc', 'docx'], required: true },
        fileSize: { type: Number, required: true }, // bytes
    },
    { _id: false }
);

const assetSchema = new mongoose.Schema(
    {
        assetTag: { type: String, unique: true, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
        serialNumber: { type: String, trim: true },
        acquisitionDate: { type: Date },
        acquisitionCost: { type: Number, min: 0 },
        condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'], default: 'Good' },
        location: { type: String, required: true, trim: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
        status: {
            type: String,
            enum: ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'],
            default: 'Available',
        },
        isShared: { type: Boolean, default: false },
        // Allows saving dynamic custom fields (like RAM, Color, Engine Size) based on the category
        customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
        attachments: {
            type: [attachmentSchema],
            validate: {
                validator: (arr) => arr.length <= 3,
                message: 'Maximum 3 attachments allowed.',
            },
            default: [],
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
