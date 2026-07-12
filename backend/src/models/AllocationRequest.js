const mongoose = require('mongoose');

// Self-service counterpart to the manager-driven `Allocation` creation flow:
// lets an Employee or Department Head ask for a currently *unowned*
// (status: 'Available') asset to be allocated to themselves or their
// department, subject to review.
const allocationRequestSchema = new mongoose.Schema(
    {
        asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
        reason: { type: String, trim: true, maxlength: 1000 },
        expectedReturnDate: { type: Date },
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

allocationRequestSchema.path('employee').validate(function validateRecipient(value) {
    return Boolean(value) !== Boolean(this.department);
}, 'Request an asset for either yourself or your department.');

module.exports = mongoose.model('AllocationRequest', allocationRequestSchema);
