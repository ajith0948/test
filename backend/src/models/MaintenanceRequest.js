const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
    {
        asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
        raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        issueDescription: { type: String, required: true, trim: true },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },
        photo: String, // URL to an uploaded image, if any
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'TechnicianAssigned', 'InProgress', 'Resolved'],
            default: 'Pending',
            index: true,
        },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rejectionReason: String,
        technician: String,
        resolvedAt: Date,
        resolutionNotes: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
