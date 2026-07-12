const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        action: { type: String, required: true, trim: true },
        module: {
            type: String,
            enum: ['Asset', 'Allocation', 'Booking', 'Maintenance', 'Audit'],
            required: true,
            index: true,
        },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
