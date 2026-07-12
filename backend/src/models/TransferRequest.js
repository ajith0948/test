const mongoose = require('mongoose');

const transferRequestSchema = new mongoose.Schema(
    {
        asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
        fromAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Allocation', required: true },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        toEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        toDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
        reason: { type: String, trim: true, maxlength: 1000 },
        status: {
            type: String,
            enum: ['Requested', 'Approved', 'Rejected'],
            default: 'Requested',
            index: true,
        },
        reviewedAt: { type: Date },
        reviewNotes: { type: String, trim: true, maxlength: 1000 },
    },
    { timestamps: true }
);

transferRequestSchema.path('toEmployee').validate(function validateRecipient(value) {
    return Boolean(value) !== Boolean(this.toDepartment);
}, 'Transfer an asset to either an employee or a department.');

module.exports = mongoose.model('TransferRequest', transferRequestSchema);
