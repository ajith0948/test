const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
    {
        asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
        expectedReturnDate: { type: Date },
        checkInNotes: { type: String, trim: true },
        status: {
            type: String,
            enum: ['Active', 'Return Requested', 'Returned', 'Transferred'],
            default: 'Active',
            index: true,
        },
        returnedAt: { type: Date },
        returnRequestedAt: { type: Date },
        returnReviewNotes: { type: String, trim: true },
    },
    { timestamps: true }
);

allocationSchema.path('employee').validate(function validateRecipient(value) {
    return Boolean(value) !== Boolean(this.department);
}, 'Allocate an asset to either an employee or a department.');

module.exports = mongoose.model('Allocation', allocationSchema);
