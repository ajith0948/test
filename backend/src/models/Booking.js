const mongoose = require('mongoose');

// A time-boxed reservation of a shared, bookable Asset (Asset.isShared === true) -
// e.g. a conference room or projector - by an employee.
const bookingSchema = new mongoose.Schema(
    {
        asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
        bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        purpose: { type: String, trim: true },
        status: {
            type: String,
            enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
            default: 'Upcoming',
            index: true,
        },
        cancelledAt: { type: Date },
    },
    { timestamps: true }
);

bookingSchema.path('endTime').validate(function validateEndAfterStart(value) {
    return !this.startTime || !value || value > this.startTime;
}, 'endTime must be after startTime.');

module.exports = mongoose.model('Booking', bookingSchema);
