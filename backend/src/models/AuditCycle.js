const mongoose = require('mongoose');

// Items are denormalized (assetTag/assetName copied at creation time) so the
// audit record reads the same way even if the asset is later renamed, and so
// the frontend contract (audit.items[].assetTag/.assetName/.result) doesn't
// need an extra populate/lookup step.
const auditItemSchema = new mongoose.Schema(
    {
        asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
        assetTag: { type: String, required: true },
        assetName: { type: String, required: true },
        result: {
            type: String,
            enum: ['Pending', 'Verified', 'Missing', 'Damaged'],
            default: 'Pending',
        },
        notes: { type: String, trim: true },
    },
    { _id: false }
);

const auditCycleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        scopeType: { type: String, enum: ['Organization', 'Department', 'Location'], required: true },
        scopeValue: { type: String, required: true, trim: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        auditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        status: { type: String, enum: ['Open', 'Closed'], default: 'Open', index: true },
        items: [auditItemSchema],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        closedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AuditCycle', auditCycleSchema);
